/*jshint esversion: 6 */

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var nodemailer = require("nodemailer");
var pdf = require('pdf-creator-node');
var fs = require('fs');
var urlencodedParser = bodyParser.urlencoded({extended:false});
var ObjectId = require('mongodb').ObjectId;

	const mongoClient = require('mongodb').MongoClient;
	const mongoDbUrl = 'mongodb://localhost:27017/connect_alumni';
	var dbcol;
	var dbcol1;
	var dbcol2;
	
   // Connect to MongoDB
	mongoClient.connect(mongoDbUrl).then(db => {
		console.log('mongodb connected');
		dbcol = db.collection('opportunities'); 
		dbcol1 = db.collection('users');
		dbcol2 = db.collection('projects')
		 // Reuse dbcol for DB CRUD operations
		

		}).catch(err => {

    // logs message upon error connecting to mongodb
    console.log('error connecting to mongodb', err);

	});


	var smtpTransport = nodemailer.createTransport({
		service: "gmail",
		secure: false,
		auth: {
			user: "niyimukundacheline@gmail.com",
			pass: "cheline1994"
		},
		debug: true
	  });


// SHOW LIST OF USERS
app.get('/opportunities', function(req, res, next) {	
	// fetch and sort users collection by id in descending order

	dbcol.find().sort({"_id": -1}).toArray (function(err, result) {
		//if (err) return console.log(err)
		console.log(result.toString());
		if (err) {
			req.flash('error', err);
			res.render('requests/opportunities', {
				title: 'Recent Opportunities', 
				data: ''
			});
		} else {
		
			// render to views/user/list.ejs template file
			res.render('requests/opportunities', {
				title: 'Recent Opportunities', 
				data: result
			});
		}
	});
});


app.get('/opportunities/almni', function(req, res, next) {	
	// fetch and sort users collection by id in descending order

	dbcol.find({'status': 'Approved'}).sort({"_id": -1}).toArray (function(err, result) {
		//if (err) return console.log(err)
		console.log(result.toString());
		if (err) {
			req.flash('error', err);
			res.render('requests/opportunitiesAlmniView', {
				title: 'Recent Opportunities', 
				data: ''
			});
		} else {
		
			// render to views/user/list.ejs template file
			res.render('requests/opportunitiesAlmniView', {
				title: 'Recent Opportunities', 
				data: result
			});
		}
	});
});


app.get('/projects', function(req, res, next) {	
	// fetch and sort users collection by id in descending order
	dbcol2.find().sort({"_id": -1}).toArray (function(err, result) {
		//if (err) return console.log(err)
		if (err) {
			req.flash('error', err);
			res.render('requests/projects', {
				title: 'Latest Projects', 
				data: ''
			});
		} else {
		
			// render to views/user/list.ejs template file
			res.render('requests/projects', {
				title: 'Latest Projects', 
				data: result
			});
		}
	});
});



app.get('/projects/almni', function(req, res, next) {	
	// fetch and sort users collection by id in descending order
	dbcol2.find({'status': 'Approved'}).sort({"_id": -1}).toArray (function(err, result) {
		//if (err) return console.log(err)
		if (err) {
			req.flash('error', err);
			res.render('requests/projectsAlmniView', {
				title: 'Latest Projects', 
				data: ''
			});
		} else {
		
			// render to views/user/list.ejs template file
			res.render('requests/projectsAlmniView', {
				title: 'Latest Projects', 
				data: result
			});
		}
	});
});















app.get('/admin', function(req, res, next) {	
	// fetch and sort users collection by id in descending order
	dbcol1.find().sort({"_id": -1}).toArray (function(err, result) {
		//if (err) return console.log(err)
		if (err) {
			req.flash('error', err);
			res.render('admin/login', {
				title: 'List of Almnus', 
				data: ''
			});
		} else {
		
			// render to views/user/list.ejs template file
			res.render('admin/viewUsers', {
				title: 'List of Almnus', 
				data: result
			});
		}
	});
});



// SHOW center FORM
app.get('/center', function(req, res, next){	
	// render to views/user/add.ejs
	res.render('admin/center', {
		title: 'Add Center',
		name: '',
		district: ''
	    		
	});
});


app.post('/center', function(req, res, next){	
	req.assert('name', ' Name is required').notEmpty();          //Validate name
	req.assert('district', 'District is required').notEmpty();
	
	var errors = req.validationErrors();
    if( !errors ) {   //No errors were found.  Passed Validation!
		
		var user = {
			name: req.sanitize('name').escape().trim(),
			district: req.sanitize('district').escape().trim(),
	
		};
				 
		dbcol2.insert(user, function(err, result) {
			if (err) {
				req.flash('error', err);
				
				// render to views/user/add.ejs
				res.render('admin/center', {
					title: 'Add Center',
		            name: '',
		           district: ''
									
				});
			} else {				
				req.flash('success', 'Center Added! ');
				// redirect to user list page				
				res.redirect('/users/viewCenter');
			}
		});		
	}
	else {   //Display errors to user
		var error_msg = '';
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>';
		});
		req.flash('error', error_msg);	
		
		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */ 
        res.render('admin/center', { 
			title: 'Add Center',
		            name: '',
		           district: ''
        });
    }
});




// SHOW LOGIN FORM

app.get('/signup', function(req, res, next){	
	// render to views/user/add.ejs
	res.render('admin/addUser', {
		title: 'Account Creation',
		fname: '',
		lname: '',
	    mobile: '',
		email: '',
		gender: '',
		studentID: '',
		username: '',
		password: '',
		graduationYear:''   		
	});
});

app.post('/signup', function(req, res, next){	
	req.assert('fname', 'First Name is required').notEmpty();          //Validate name
	req.assert('lname', 'Last Name is required').notEmpty();
	req.assert('mobile', 'Mobile Number is required').notEmpty();		//Validate age
	req.assert('email', 'A valid email is required').isEmail();  //Validate email
	req.assert('gender', 'Please fill in student gender').notEmpty();
	req.assert('studentID', 'Student ID is required').notEmpty(); 
	req.assert('username', 'username is required').notEmpty(); 
	req.assert('password', 'password name is required').notEmpty(); 
	req.assert('graduationYear', 'graduation year is required').notEmpty(); 
	 
    var errors = req.validationErrors();
    if( !errors ) {   //No errors were found.  Passed Validation!
		
		var user = {
			fname: req.sanitize('fname').escape().trim(),
			lname: req.sanitize('lname').escape().trim(),
			mobile: req.sanitize('mobile').escape().trim(),
			email: req.sanitize('email').escape().trim(),
			gender: req.sanitize('gender').escape().trim(),
			studentID: req.sanitize('studentID').escape().trim(),
			username: req.sanitize('username').escape().trim(),
			password: req.sanitize('password').escape().trim(),
			graduationYear: req.sanitize('graduationYear').escape().trim(),

		};
				 
		dbcol1.insert(user, function(err, result) {
			if (err) {
				req.flash('error', err);
				
				// render to views/user/add.ejs
				res.render('admin/addUser', {
					title: 'Add New User',
					fname: user.fname,
					lname: user.lname,
					age: user.age,
					mobile: user.mobile,
					email: user.email,
					gender: user.gender,
					username: user.username,
					password: user.password,
					center: user.center
									
				});
			} else {				
				req.flash('success', 'Welcome to Login page! ');
				// redirect to user list page				
				res.redirect('/users/login');
			}
		});		
	}
	else {   //Display errors to user
		var error_msg = '';
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>';
		});
		req.flash('error', error_msg);	
		
		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */ 
        res.render('admin/signup', { 
            title: 'Add New User',
            fname: req.body.fname,
            lname: req.body.lname,
            age: req.body.age,
            mobile: req.body.mobile,
			email: req.body.email,
			gender: req.body.gender,
			identity: req.body.identity,
			province: req.body.province,
			district: req.body.district,
			counselor: req.body.counselor
        });
    }
});
app.get('/login', function(req, res, next){	
	// render to views/user/add.ejs
	res.render('admin/login', {
		title: 'Account Login',
		id :'',
		username: '',
		password: ''   		
	});
});

app.post('/login',urlencodedParser,function(req,res){

	req.assert('username', 'username is required').notEmpty();
	req.assert('password', 'password name is required').notEmpty();
	
	 const userName = req.body.username;
	 const passWord = req.body.password;
	dbcol1.findOne({username: userName},function(err, userData) {
			  if(userData === null){
				req.flash('error', "User doesn't exist!!Please contact system adminstrator");
			   res.render('admin/login',{
				title: 'Account Login',
				id :'',
				username: '',
				password: ''   

			   });
			 } else if (userData.username === userName && userData.password === passWord) {
				   if(userData.username === 'admin@log.com') {
					res.redirect('/users/admin')
				   } else {
					res.redirect('/users/projects/almni')  
				   }
				
			
		   } else {
			   //req.flash();
			   req.flash('error', "Invalid username or password!!Please enter valid credentials");
			   res.render('admin/login',{
				title: 'Account Login',
				id :'',
				username: '',
				password: ''   

			   });
	
		   }
	});
 
 });

 app.get('/viewCenter', function(req, res, next){	
	// render to views/user/add.ejs
	dbcol2.find().sort({"_id": -1}).toArray (function(err, resultCenter) {
		//console.log(centerresult.toString());
	
		if (err) {
			req.flash('error', err);
			res.render('/users', {
				title: 'List of Almnus', 
				data: ''
			});
		} else {
		
			// render to views/user/list.ejs template file
			res.render('admin/viewCenter', {
				title: 'Centers List', 
				data: resultCenter
			});
		}
		
		
		
	});
	//res.json({Result : centerresult});
	
   });
   

// SHOW ADD USER FORM
app.get('/add', function(req, res, next){	
	// render to views/user/add.ejs
	dbcol.find().sort({"_id": -1}).toArray (function(err, centerresult) {
		//console.log(centerresult.toString());
		res.render('requests/addOpportunity', {
			title: 'Post New Opportunity',
			name: '',
			type: '',
			sector: '',
			postedBy: '',
			details: ''
								
		});
	//res.json({Result : centerresult});
	
   });
   
});



// ADD NEW OPPORTUNITY POST ACTION
app.post('/add', function(req, res, next){	
	req.assert('name', 'Name is required').notEmpty();          //Validate name
	req.assert('type', 'Type is required').notEmpty();
	req.assert('sector', 'Sector is required').notEmpty();
	req.assert('postedBy', 'Email is required').isEmail();		//Validate age
	req.assert('details', 'Details required').notEmpty();  //Validate email
	
	 
	
    var errors = req.validationErrors();
    if( !errors ) {   //No errors were found.  Passed Validation!
		
		var user = {
			name: req.sanitize('name').escape().trim(),
			type: req.sanitize('type').escape().trim(),
			sector: req.sanitize('sector').escape().trim(),
			postedBy: req.sanitize('postedBy').escape().trim(),
			details: req.body.details,
			status:'Pending',
			Date : 'Not Confirmed',
			Time :'Not Confirmed',
		

		};
				 
		dbcol.insert(user, function(err, result) {
			if (err) {
				req.flash('error', err);
				
				// render to views/user/add.ejs
				res.render('requests/addOpportunity', {
					title: 'Post New Opportunity',
					name: user.name,
					type: user.type,
					sector: user.sector,
					postedBy: user.postedBy,
					details: user.details,
					status: 'pending'					
				});
			} else {				
				req.flash('success', 'Opportunity post request successfully!We will send you a confirmation on your email');
				// redirect to user list page				
				res.redirect('/users/add');
			}
		});		
	}
	else {   //Display errors to user
		var error_msg = '';
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>';
		});
		req.flash('error', error_msg);	
		
		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */ 
		res.render('requests/addOpportunity', {
			title: 'Post New Opportunity',
			name:  '',
			type:  '',
			sector: '',
			postedBy: '',
			details: '',
			status: 'pending'					
		});
    }
});




// SHOW ADD PROJECT FORM
app.get('/addProject', function(req, res, next){	
	// render to views/user/add.ejs
	dbcol2.find().sort({"_id": -1}).toArray (function(err, centerresult) {
		//console.log(centerresult.toString());
		res.render('requests/addProject', {
			title: 'Post New Project',
			name: '',
			manager: '',
			sector: '',
			postedBy: '',
			details: ''
								
		});
	//res.json({Result : centerresult});
	
   });
   
});



// ADD NEW PROJECT POST ACTION
app.post('/addProject', function(req, res, next){	
	req.assert('name', 'Title is required').notEmpty();          //Validate name
	req.assert('manager', 'Project Manager is required').notEmpty();
	req.assert('sector', 'Sector is required').notEmpty();
	req.assert('postedBy', 'Email is required').isEmail();		//Validate age
	req.assert('details', 'Details required').notEmpty();  //Validate email
	
	 
	
    var errors = req.validationErrors();
    if( !errors ) {   
		
		// console.log( req.sanitize('details'));//No errors were found.  Passed Validation!
		
		var project = {
			name: req.sanitize('name').escape().trim(),
			manager: req.sanitize('manager').escape().trim(),
			sector: req.sanitize('sector').escape().trim(),
			postedBy: req.sanitize('postedBy').escape().trim(),
			details: req.body.details,
			status:'Pending',
			Date : 'Not Confirmed',
			Time :'Not Confirmed',
		

		};
				 
		dbcol2.insert(project, function(err, result) {
			if (err) {
				req.flash('error', err);
				
				// render to views/user/add.ejs
				res.render('requests/addProject', {
					title: 'Post New Project',
					name: project.name,
					manager: project.manager,
					sector: project.sector,
					postedBy: project.postedBy,
					details: project.details,
					status: 'pending'					
				});
			} else {				
				req.flash('success', 'Project post request successfully!We will send you a confirmation on your email');
				// redirect to user list page				
				res.redirect('/users/addProject');
			}
		});		
	}
	else {   //Display errors to user
		var error_msg = '';
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>';
		});
		req.flash('error', error_msg);	
		
		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */ 
		res.render('requests/addOpportunity', {
			title: 'Post New Project',
			name:  '',
			manager:  '',
			sector: '',
			postedBy: '',
			details: '',
			status: 'pending'					
		});
    }
});






// SHOW EDIT USER FORM
app.get('/edit/(:id)', function(req, res, next){
	var o_id = new ObjectId(req.params.id);
	dbcol2.find({"_id": o_id}).toArray(function(err, result) {
		if(err) {
			return console.log(err);
		}
		
		// if user not found
		if (!result) {
			req.flash('error', 'Project not found with id = ' + req.params.id);
			res.redirect('/users/projects');
		}
		else { // if user found
			// render to views/user/edit.ejs template file
			res.render('requests/edit', {
				title: 'Edit Project', 
				//data: rows[0],
				id: result[0]._id,
				name: result[0].name,
				manager: result[0].manager,
				sector: result[0].sector,
				postedBy: result[0].postedBy,
				details: result[0].details
			
			});
		}
	});
});



// SHOW EDIT USER FORM
app.get('/editOpportunity/(:id)', function(req, res, next){
	var o_id = new ObjectId(req.params.id);
	dbcol.find({"_id": o_id}).toArray(function(err, result) {
		if(err) {
			return console.log(err);
		}
		
		// if user not found
		if (!result) {
			req.flash('error', 'Opportunity not found with id = ' + req.params.id);
			res.redirect('/users/opportunities');
		}
		else { // if user found
			// render to views/user/edit.ejs template file
			res.render('requests/editOpportunity', {
				title: 'Edit Opportunity', 
				//data: rows[0],
				id: result[0]._id,
				name: result[0].name,
				type: result[0].type,
				sector: result[0].sector,
				postedBy: result[0].postedBy,
				details: result[0].details
			
			});
		}
	});
});



// EDIT USER POST ACTION
app.put('/edit/(:id)', function(req, res, next) {
	req.assert('name', 'Title is required').notEmpty();          //Validate name
	req.assert('manager', 'Project Manager is required').notEmpty();
	req.assert('sector', 'Sector is required').notEmpty();
	req.assert('postedBy', 'Email is required').isEmail();		//Validate age
	req.assert('details', 'Details required').notEmpty(); 
	

    var errors = req.validationErrors();
    
    if( !errors ) {   //No errors were found.  Passed Validation!
		var user = {
				
			name: req.sanitize('name').escape().trim(),
			manager: req.sanitize('manager').escape().trim(),
			sector: req.sanitize('sector').escape().trim(),
			postedBy: req.sanitize('postedBy').escape().trim(),
			details: req.sanitize('details').escape().trim(),
				
		};
		
		var o_id = new ObjectId(req.params.id);
		dbcol2.update({"_id": o_id}, user, function(err, result) {
			if (err) {
				req.flash('error', err);
				
				// render to views/user/edit.ejs
				res.render('requests/edit', {
					title: 'Edit Project',
					id: req.params.id,
					name: req.body.name,
					manager: req.body.manager,
					sector: req.params.sector,
					postedBy: req.body.postedBy,
					details: req.body.details

							
				});
			} else {
				req.flash('success', 'Data updated successfully!');
				
				res.redirect('/users/projects');
			}
		});	
	}
	else {   //Display errors to user
		var error_msg = '';
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>';
		});
		req.flash('error', error_msg);
		
		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */ 
        res.render('requests/edit', { 
            title: 'Edit Project',            
			id: req.params.id,
			name: req.body.name,
			manager: req.body.manager,
			sector: req.params.sector,
			postedBy: req.body.postedBy,
			details: req.body.details
					
        });
    }
});



app.put('/editOpportunity/(:id)', function(req, res, next) {
	req.assert('name', 'Title is required').notEmpty();          //Validate name
	req.assert('type', 'Type is required').notEmpty();
	req.assert('sector', 'Sector is required').notEmpty();
	req.assert('postedBy', 'Email is required').isEmail();		//Validate age
	req.assert('details', 'Details required').notEmpty(); 
	

    var errors = req.validationErrors();
    
    if( !errors ) {   //No errors were found.  Passed Validation!
		var user = {
				
			name: req.sanitize('name').escape().trim(),
			type: req.sanitize('type').escape().trim(),
			sector: req.sanitize('sector').escape().trim(),
			postedBy: req.sanitize('postedBy').escape().trim(),
			details: req.sanitize('details').escape().trim(),
				
		};
		
		var o_id = new ObjectId(req.params.id);
		dbcol.update({"_id": o_id}, user, function(err, result) {
			if (err) {
				req.flash('error', err);
				
				// render to views/user/edit.ejs
				res.render('requests/editOpportunity', {
					title: 'Edit Opportunity',
					id: req.params.id,
					name: req.body.name,
					type: req.body.type,
					sector: req.params.sector,
					postedBy: req.body.postedBy,
					details: req.body.details

							
				});
			} else {
				req.flash('success', 'Data updated successfully!');
				
				res.redirect('/users/opportunities');
			}
		});	
	}
	else {   //Display errors to user
		var error_msg = '';
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>';
		});
		req.flash('error', error_msg);
		
		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */ 
        res.render('requests/editOpportunity', { 
            title: 'Edit Opportunity',            
			id: req.params.id,
			name: req.body.name,
			type: req.body.type,
			sector: req.params.sector,
			postedBy: req.body.postedBy,
			details: req.body.details
					
        });
    }
});




app.delete('/send/(:id)', function(req, res, next) {	
	var o_id = req.params.id;
	dbcol2.remove({"_id": ObjectId(o_id)},(err, result) => {
		if(err) {
			return console.log(err);
		}
		
		// if user not found
		else if (!result) {
			req.flash('error', 'Project not found with id = ' + req.params.id);
			res.redirect('/users/projects');
		}
		else { // if user found
			// render to views/user/edit.ejs template file
			

			req.flash('success', 'Project has been Deleted');
			res.redirect('/users/projects');
		}
	});
	
});


app.delete('/sendOpportunity/(:id)', function(req, res, next) {	
	var o_id = req.params.id;
	dbcol.remove({"_id": ObjectId(o_id)},(err, result) => {
		if(err) {
			return console.log(err);
		}
		
		// if user not found
		else if (!result) {
			req.flash('error', 'Opportunity not found with id = ' + req.params.id);
			res.redirect('/users/opportunities');
		}
		else { // if user found
			// render to views/user/edit.ejs template file
			

			req.flash('success', 'Opportunity has been Deleted');
			res.redirect('/users/opportunities');
		}
	});
	
});



///Get The Approve Page
app.get('/approve/(:id)', function(req, res, next){
	var o_id = new ObjectId(req.params.id);
	dbcol.find({"_id": o_id}).toArray(function(err, result) {
		if(err) {
			return console.log(err);
		}
		
		// if user not found
		if (!result) {
			req.flash('error', 'Opportunity not found with id = ' + req.params.id);
			res.redirect('/users/opportunities');
		}
		else { // if user found
			// render to views/user/edit.ejs template file
			res.render('requests/approve', {
				title: 'Approve this Opportunity', 
				//data: rows[0],
				id: result[0]._id,
				name: result[0].name,
				status: 'Approved'
				


			});
		}
	});
});



///Approve Status
app.patch('/approve/(:id)', function(req, res, next) {	
	var o_id = new ObjectId(req.params.id);
	req.assert('name', ' Name is required').notEmpty();           //Validate name
	req.assert('status', 'Approve is required').notEmpty();

	

	var errors = req.validationErrors();
	if(!errors) {
   var user = {
	//name: req.sanitize('name').escape().trim(),
	status: req.sanitize('status').escape().trim(),

   }
	
	
	dbcol.updateOne(
		{ _id: o_id  }, { $set: { status: user.status } }, (err, result)=> {
		if(err) {
			return console.log(err);
		}
		
		// if user not found
		if (!result) {
			req.flash('error', 'Opportunity not found with id = ' + req.params.id);
			res.redirect('/users/opportunities');
		}
		else { // if user found
			// render to views/user/edit.ejs template file
			

			req.flash('success', 'Opportunity Approved');
			res.redirect('/users/opportunities');
		}
	});
}
});



///Get The Approve Page
app.get('/approveProject/(:id)', function(req, res, next){
	var o_id = new ObjectId(req.params.id);
	dbcol2.find({"_id": o_id}).toArray(function(err, result) {
		if(err) {
			return console.log(err);
		}
		
		// if user not found
		if (!result) {
			req.flash('error', 'Opportunity not found with id = ' + req.params.id);
			res.redirect('/users/project');
		}
		else { // if user found
			// render to views/user/edit.ejs template file
			res.render('requests/approveProject', {
				title: 'Approve this project', 
				//data: rows[0],
				id: result[0]._id,
				name: result[0].name,
				status: 'Approved'
				


			});
		}
	});
});

///Approve Status
app.patch('/approveProject/(:id)', function(req, res, next) {	
	var o_id = new ObjectId(req.params.id);
	req.assert('name', ' Name is required').notEmpty();           //Validate name
	req.assert('status', 'Approve is required').notEmpty();

	

	var errors = req.validationErrors();
	if(!errors) {
   var user = {
	//name: req.sanitize('name').escape().trim(),
	status: req.sanitize('status').escape().trim(),

   }
	
	
	dbcol2.updateOne(
		{ _id: o_id  }, { $set: { status: user.status } }, (err, result)=> {
		if(err) {
			return console.log(err);
		}
		
		// if user not found
		if (!result) {
			req.flash('error', 'Project not found with id = ' + req.params.id);
			res.redirect('/users/projects');
		}
		else { // if user found
			// render to views/user/edit.ejs template file
			

			req.flash('success', 'Project Approved');
			res.redirect('/users/projects');
		}
	});
}
});





//send email to customers
app.delete('/sendEmail/(:id)', function(req, res, next) {	
	var o_id = new ObjectId(req.params.id);
	dbcol.find({"_id": o_id}).toArray(function(err, result) {
		if(err) {
			return console.log(err);
		}
		
		// if user not found
		if (!result) {
			req.flash('error', 'Apppointment not found with id = ' + req.params.id);
			res.redirect('/users/projects');
		}
		else { // if user found
			// render to views/user/edit.ejs template file
			res.render('contact', {
				title: 'Send Email', 
				//data: rows[0],
				id: result[0]._id,
				fname: result[0].fname,
				email: result[0].email,
				subject : '',
				message :''
				
			});
		}
	});
	
});






//send email to doctorsss
app.delete('/sendEmailAdmin/(:id)', function(req, res, next) {	
	var o_id = new ObjectId(req.params.id);
	dbcol1.find({"_id": o_id}).toArray(function(err, result) {
		if(err) {
			return console.log(err);
		}
		
		// if user not found
		if (!result) {
			req.flash('error', 'Doctor not found with id = ' + req.params.id);
			res.redirect('/users');
		}
		else { // if user found
			// render to views/user/edit.ejs template file
			res.render('contact', {
				title: 'Send Email', 
				//data: rows[0],
				id: result[0]._id,
				fname: result[0].fname,
				email: result[0].email,
				subject : '',
				message :''
				
			});
		}
	});
	
});



app.post('/sendEmail/(:id)',function(req,res){
	var user = {
		email: req.sanitize('email').escape().trim(),
		subject: req.sanitize('subject').escape().trim(),
		message: req.sanitize('message').escape().trim(),
	};
    var mailOptions={
        to: user.email,
        subject : user.subject,
        text : user.message
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
     if(error){
        console.log(error);
        res.end("error");
     } else{
			console.log("Message sent: " + response.message);
			req.flash('success', 'Email Sent Successfully!');
			res.redirect('/');	
        }
    });
});

app.get('/logout',function(req,res) {

	res.render('admin/login',{
		title : 'Login Page',
		username: '',
		password : ''



	});

})

// req.flash('success', 'File Created Successfully');
// 			res.redirect('/users/projects');

app.get("/generateReport", async (req, res)  =>  {
  
	const template = fs.readFileSync("./views/template.html","utf-8")


	const options = {
		format : "A2",
		orientation: "portrait",
		border: "50mm",
	}


	const products = await dbcol2.find().sort({"_id": -1}).toArray();

	const document = {
		html : template,
		data: {
			products,
		},
		path: "./pdfs/report.pdf",
	}

	pdf.create(document,options)
	.then((result)=> {
   req.flash('success', 'Pdf File Created Successfully');
   res.redirect('/users/projects');

	}).catch((err) => {
		req.flash('error', 'Failed to download pdf file with' + err);
   res.redirect('/users/projects');

	})
}
)




module.exports = app;
