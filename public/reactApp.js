
var React = require('react');
var Dropzone = require('react-dropzone');
import ReactDOM from 'react-dom';
import $ from 'jquery';
import jQuery from 'jquery';
import request from 'superagent';





var userName = "";
var userPassword = ""; 
//
var InstaScam = React.createClass({

    getInitialState: function () {
        return { loggedInUser: "" };
    },

    logMeIn: function (userId) {
        this.setState({ loggedInUser: userId });
    },

    render: function () {
        if (this.state.loggedInUser !== "") {
            return (<PicList user={this.state.loggedInUser} />);
        } else {
            return (
                <Login setLoggedIn={this.logMeIn} />

            );

        }
    }

});

var Register = React.createClass({
    getInitialState: function () {
        return { registered: false };
    },
    handleClick: function () {

    },
    render: function () {
        return (
            <div className="span3 offset8 pull-left" >
                <a href="#" className="btn btn-primary btn-large" onClick={this.handleClick}>

                    <i className="icon-white icon-user"></i> Register New User</a>
            </div>
        )

    }
});

var Login = React.createClass({
    getInitialState: function () {
        return { error: false };
    },

    handleClick: function (event) {
        userName = $("#userid").val();
        userPassword = $("#password").val();
        var userObj = {
            "userName": userName,
            "password": userPassword
        };
        console.log(userObj.userName);
        var that = this;
        $.post("/login/", userObj, function (data) {

        }).done(function (loggedInUser) {
            console.log('about to set state');
            that.setState({ error: false });
            console.log('after set state');
            console.log(loggedInUser);
            that.props.setLoggedIn(loggedInUser.UserName);

        }).fail(function () {
            $("#instahome").hide();
            that.setState({ error: true });
        })

    },

    render: function () {
        if (this.state.error) {
            return (
                <div className="everything">
                    <div className="form">


                        <h2><span className="entypo-login"></span> InstaScam Login</h2>
                        <button className="login" onClick={this.handleClick}><span className="entypo-lock"></span></button>
                        <span className="entypo-user inputUserIcon"></span>
                        <input type="text" className="user" placeholder="username" name="userid" id="userid"/>
                        <span className="entypo-key inputPassIcon"></span>
                        <input type="password" className="pass" placeholder="password" name="password" id="password"/>
                        <h1 style={{ color: 777 }}>Login Failed.Please retry.</h1>

                    </div>
                    <Register />
                </div>
            );
        } else {
            return (
                <div className="everything">
                    <div className="form">


                        <h2><span className="entypo-login"></span> InstaScam Login</h2>
                        <button className="login" onClick={this.handleClick}><span className="entypo-lock"></span></button>
                        <span className="entypo-user inputUserIcon"></span>
                        <input type="text" className="user" placeholder="username" name="userid" id="userid"/>
                        <span className="entypo-key inputPassIcon"></span>
                        <input type="password" className="pass" placeholder="password" name="password" id="password"/>


                    </div>
                    <Register />
                </div>




            );
        }
    }
});

var PicList = React.createClass({
    getInitialState: function () {
        return { picList: [] };
    },


    
    componentDidMount: function () {
        this.getDbPics();
    },

    getDbPics: function (){
        var that = this;
        console.log(this.props.user);
        $.getJSON("/getPictures/" + this.props.user, function (data) {
            that.setState({ picList: data });
        });
    },

    render: function () {
        return (
            <div id="instahome">
                <h1>Welcome to Instagram Pictures!</h1>
                        <div className="row">
                            <div className="span2 offset5">
                                Welcome {this.props.user}
                                <DropzoneDemo user={this.props.user} refresh={this.getDbPics}/>
                                <br/>
                             </div>
                        </div>

                        <div id="picFeed">
                            {
                                this.state.picList.map(function (val, idx) {
                                    return <Pic key={idx} data={val}/>;
                                })
                            }
                       
                </div>
            </div>
        );





    }
});

var Pic = React.createClass({
    getInitialState: function () {
        return {};
    },

    render: function () {
        var data = this.props.data;
        var picLocation = "/static/photos/" + data.UserName + "/" + data.SystemFileName;
        return (
            <div className="row">
                <div className="span2 offset5">
                    <img src={picLocation}/>
                    <br/>
                    File: {data.ActualFileName}
                </div>
            </div>
        );
    }
});

var DropzoneDemo = React.createClass({
    getInitialState: function () {
        return { files: [] };
    },
    onDrop: function (files) {
        
        var req = request.post('/insertPicture');
        files.forEach((file) => {
            req.attach('dropzone', file);
            req.field("userName", this.props.user);
        });
        var that = this;
        req.end(function (err, res){
            if (err) {

            }
            else{
                that.props.refresh();
            }

        });
        
    },
    onOpenClick: function () {
        this.refs.dropzone.open();
    },
    render: function () {
        return (
            <div>
                <Dropzone ref="dropzone" onDrop={this.onDrop}>
                    <div>Try dropping some files here, or click to select files to upload.</div>
                </Dropzone>
                <button type="button" onClick={this.onOpenClick}>
                    Open Dropzone
                </button>
                {this.state.files.length > 0 ? <div>
                <h2>Uploading {this.state.files.length} files...</h2>
                <div>{this.state.files.map((file) => <img src={file.preview} />)}</div>
                </div> : null}
            </div>
        );
    }
});

ReactDOM.render(
    <InstaScam />,
    document.getElementById('InstaScam')
);


