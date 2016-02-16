Websites = new Mongo.Collection("websites");

if (Meteor.isClient) {

	// Router configuration
	Router.configure({
	  layoutTemplate: 'appLayout'
	});

	Router.route('/', function () {
	  this.render('nav', {
	    to:"navbar"
	  });
	  this.render('websites', {
	    to:"main"
	  });
	});

	Router.route('/details/:_id', function () {
	  this.render('nav', {
	    to:"navbar"
	  });
	  this.render('details', {
	    to:"main",
	    data:function(){
	      return Websites.findOne({_id:this.params._id});
	    }
	  });
	});

	// configuring the login to accept usernames
	Accounts.ui.config({passwordSignupFields: 'USERNAME_AND_EMAIL'})

	/////
	// template helpers
	/////

	// helper function that returns all available websites
	Template.website_list.helpers({
		websites:function(){
			if (Session.get('searching') != true){
				return Websites.find({}, {sort: {upvote: -1}});
			} else {
				return Websites.find({title: Session.get('searched')});
			}
		}
	});

	Template.website_form.helpers({
		title: function(){
			return Session.get('title');
		},

		description: function(){
			return Session.get('description')
		}
	});

	/////
	// template events
	/////

	Template.website_item.events({
		"click .js-upvote":function(event){
			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			// put the code in here to add a vote to a website!
			if (Meteor.userId()){
				console.log("Up voting website with id " + website_id);
				Websites.update(
					{_id: website_id},
					{$inc: {upvote: 1}}
				);
			} else {
				console.log("please log in to vote");
			}
			return false;// prevent the button from reloading the page
		},

		"click .js-downvote":function(event){
			// example of how you can access the id for the website in the database
			// (this is the data context for the template)
			var website_id = this._id;
			// put the code in here to remove a vote from a website!
			if (Meteor.userId()){
				console.log("Down voting website with id " + website_id);
				Websites.update(
					{_id: website_id},
					{$inc: {downvote: -1}}
				);
			} else {
				console.log("please log in to vote");
			}
			return false;// prevent the button from reloading the page
		}
	})

	Template.website_form.events({
		"click .js-toggle-website-form":function(event){
			$("#website_form").toggle('slow');
		},

		"submit .js-save-website-form":function(event){

			// here is an example of how to get the url out of the form:
			var url = event.target.url.value;
			var title = event.target.title.value;
			var description = event.target.description.value;
			console.log("The url they entered is: "+ url + " description " + description + " "+ new Date());
			//  put your website saving code in here!

			if (Meteor.userId()){
				// code as is will submit blank fields. Needs to add a check.
				// insert additional if statement for blank url, title & description
				// it can also be done html side, preventing the submission of the form.
				Websites.insert({
					title: title,
					description: description,
					url: url,
					createdOn: new Date()
				});

				// deleting the fields on the webpage
				event.target.url.value = "";
				event.target.title.value = "";
				event.target.description.value = "";

			} else {
				console.log("you need to log in");
			}

			return false;// stop the form submit from reloading the page

		},

		"blur .js-url": function(event){
			// event.preventDefault(); I believe this line is not necessary
				var url = event.target.value;
				Meteor.call('getWebsite', url, function(error, result){
					if (error){
						console.log("erroooor");
					} else {
						var content = result.content;
						Session.set('title', $(content).filter('title').text());
						Session.set('description', $(content).filter("meta[name='description']").attr("content"));
					}
				});

		} // end of blur
	});

	Template.details.events({
		"submit .js-save-comments-form":function(event){
			event.preventDefault();
			var website_id = this._id;

			if (Meteor.userId()){
				var userComment = event.target.comment.value;
				console.log(comment);

				Websites.update({_id: website_id}, {$push: {comment: userComment}})
				console.log(Websites.find({_id: website_id}));
				// clear the comment field
				event.target.comment.value = "";

			} else {
				console.log("you need to log in to comment");
				// users won't be able to submit on the html side by default
			} // end of else

		} // end of submit event
	});

	Template.nav.events({
		"keyup .js-search, submit form": function(event){
			event.preventDefault(); // not preventing the enter button event

			setInterval(function(){ // only works the first time.
				var title = event.target.value;
				if (event.target.value == ""){
					Session.set('searching', false);
				} else {
					Session.set('searching', true);
				}
				Session.set('searched', title);
			}, 2500);

		} // end of .js search function
	}); // end of nav.event

}


if (Meteor.isServer) {

	Meteor.methods({
		getWebsite: function(url){
			try {
				var result = HTTP.call("GET", url);
				return result;
			} catch(error){
				return false;
			}
		}

		/*
		function(url){
			HTTP.call('GET', url, {}, function(error, response){
				if (error){
					return error
				} else {
					console.log(response.content);
					return response.content
				}
			});
		}       // returning undefined on the client side
		*/
	});


	// start up function that creates entries in the Websites databases.
  Meteor.startup(function () {
    // code to run on server at startup
    if (!Websites.findOne()){
    	console.log("No websites yet. Creating starter data.");
    	  Websites.insert({
    		title:"Goldsmiths Computing Department",
    		url:"http://www.gold.ac.uk/computing/",
    		description:"This is where this course was developed.",
    		createdOn:new Date()
    	});
    	 Websites.insert({
    		title:"University of London",
    		url:"http://www.londoninternational.ac.uk/courses/undergraduate/goldsmiths/bsc-creative-computing-bsc-diploma-work-entry-route",
    		description:"University of London International Programme.",
    		createdOn:new Date()
    	});
    	 Websites.insert({
    		title:"Coursera",
    		url:"http://www.coursera.org",
    		description:"Universal access to the world’s best education.",
    		createdOn:new Date()
    	});
    	Websites.insert({
    		title:"Google",
    		url:"http://www.google.com",
    		description:"Popular search engine.",
    		createdOn:new Date()
    	});
    }
  });
}
