var Router, assessmentCollection, startApp,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
  _this = this;

Router = (function(_super) {

  __extends(Router, _super);

  function Router() {
    Router.__super__.constructor.apply(this, arguments);
  }

  Router.prototype.routes = {
    "assessment/:id": "assessment",
    "result/:database_name/:id": "result",
    "results/:database_name": "results",
    "print/:id": "print",
    "student_printout/:id": "student_printout",
    "login": "login",
    "logout": "logout",
    "manage": "manage",
    "assessments": "assessments",
    "": "assessments"
  };

  Router.prototype.results = function(database_name) {
    return this.verify_logged_in({
      success: function() {
        var _this = this;
        return $.couch.db(database_name).view("reports/byEnumerator", {
          key: $.enumerator,
          success: function(result) {
            var resultsView;
            resultsView = new ResultsView;
            resultsView.results = new ResultCollection(_.pluck(result.rows, "value"));
            resultsView.results.databaseName = database_name;
            return resultsView.render();
          }
        });
      }
    });
  };

  Router.prototype.result = function(database_name, id) {
    return this.verify_logged_in({
      success: function() {
        var _this = this;
        return $.couch.db(database_name).openDoc(id, {
          success: function(doc) {
            var resultView;
            resultView = new ResultView();
            resultView.model = new Result(doc);
            return $("#content").html(resultView.render());
          }
        });
      }
    });
  };

  Router.prototype.manage = function() {
    return this.verify_logged_in({
      success: function() {
        var assessmentCollection;
        assessmentCollection = new AssessmentCollection();
        return assessmentCollection.fetch({
          success: function() {
            var manageView;
            manageView = new ManageView();
            return manageView.render(assessmentCollection);
          }
        });
      }
    });
  };

  Router.prototype.assessments = function() {
    return this.verify_logged_in({
      success: function() {
        var assessmentListView;
        $('#current-student-id').html("");
        $('#enumerator').html($.enumerator);
        assessmentListView = new AssessmentListView();
        return assessmentListView.render();
      }
    });
  };

  Router.prototype.login = function() {
    return Tangerine.login.render();
  };

  Router.prototype.logout = function() {
    return $.couch.logout({
      success: function() {
        $.enumerator = null;
        $('#enumerator').html("Not logged in");
        return Tangerine.router.navigate("login", true);
      }
    });
  };

  Router.prototype.assessment = function(id) {
    return this.verify_logged_in({
      success: function() {
        var assessment;
        $('#enumerator').html($.enumerator);
        assessment = new Assessment({
          _id: id
        });
        return assessment.fetch({
          success: function() {
            return assessment.render();
          }
        });
      }
    });
  };

  Router.prototype.verify_logged_in = function(options) {
    return $.couch.session({
      success: function(session) {
        $.enumerator = session.userCtx.name;
        Tangerine.router.targetroute = document.location.hash;
        if (!session.userCtx.name) {
          Tangerine.router.navigate("login", true);
          return;
        }
        return options.success();
      }
    });
  };

  Router.prototype.print = function(id) {
    return Assessment.load(id, function(assessment) {
      return assessment.toPaper(function(result) {
        var style;
        style = "          body{            font-family: Arial;          }          .page-break{            display: block;            page-break-before: always;          }          input{            height: 50px;              border: 1px          }        ";
        $("body").html(result);
        return $("link").remove();
      });
    });
  };

  Router.prototype.student_printout = function(id) {
    return Assessment.load(id, function(assessment) {
      return assessment.toPaper(function(result) {
        var style;
        style = "          <style>            body{              font-family: Arial;              font-size: 200%;            }            .page-break{              display: none;            }            input{              height: 50px;                border: 1px;            }            .subtest.ToggleGridWithTimer{              page-break-after: always;              display:block;              padding: 15px;            }            .subtest, button, h1{              display:none;            }            .grid{              display: inline;              margin: 5px;            }          </style>        ";
        $("style").remove();
        $("body").html(result + style);
        $("span:contains(*)").parent().remove();
        $("link").remove();
        return $('.grid').each(function(index) {
          if (index % 10 === 0) {
            return $(this).nextAll().andSelf().slice(0, 10).wrapAll('<div class="grid-row"></div>');
          }
        });
      });
    });
  };

  return Router;

})(Backbone.Router);

startApp = function() {
  Tangerine.router = new Router();
  Tangerine.login = new LoginView();
  return Backbone.history.start();
};

$.couch.config({
  success: function(result) {
    if (_.keys(result).length === 0) {
      return $.couch.config({}, "admins", Tangerine.config.user_with_database_create_permission, Tangerine.config.password_with_database_create_permission);
    }
  },
  error: function() {}
}, "admins");

assessmentCollection = new AssessmentCollection();

assessmentCollection.fetch({
  success: function() {
    assessmentCollection.each(function(assessment) {
      return $.couch.db(assessment.targetDatabase()).info({
        error: function(a, b, errorType) {
          if (errorType === "no_db_file") {
            return Utils.createResultsDatabase(assessment.targetDatabase(), function() {
              return $.couch.logout();
            });
          }
        }
      });
    });
    return _this.startApp();
  }
});