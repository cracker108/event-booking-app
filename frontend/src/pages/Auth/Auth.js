import React, { Component } from "react";

import "./Auth.css";
import AuthContext from "../../context/auth.context";

class AuthPage extends Component {
  state = {
    isLoggedIn: true,
  };

  static contextType = AuthContext;

  valid = true;

  constructor(props) {
    super(props);
    this.emailElement = React.createRef();
    this.passwordElement = React.createRef();
  }

  switchHandler = () => {
    this.setState((prevState) => {
      return { isLoggedIn: !prevState.isLoggedIn };
    });
  };

  submitHandler = (event) => {
    event.preventDefault();
    const email = this.emailElement.current.value;
    const password = this.passwordElement.current.value;

    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }

    let requestBody = {
      query: `
        query Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            userId
            token
            tokenExpiration
          }
        }
      `,
      variables: {
        email: email,
        password: password,
      },
    };

    if (!this.state.isLoggedIn) {
      requestBody = {
        query: `
          mutation CreateUser($email: String!, $password: String!) {
            createUser(userInput: {email: $email, password: $password}) {
              userId
              token
              tokenExpiration
            }
          }
        `,
        variables: {
          email: email,
          password: password,
        },
      };
    }

    fetch("http://localhost:5000/home", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then((resData) => {
        if (resData.data.login && resData.data.login.token) {
          this.context.login(
            resData.data.login.token,
            resData.data.login.userId,
            resData.data.login.tokenExpiration
          );
        } else if (resData.data.createUser && resData.data.createUser.token) {
          this.context.login(
            resData.data.createUser.token,
            resData.data.createUser.userId,
            resData.data.createUser.tokenExpiration
          );
        }
        if (this.valid) {
          this.setState({
            isLoggedIn: true,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  componentWillUnmount() {
    this.valid = false;
  }

  render() {
    return (
      <form className="auth-form" onSubmit={this.submitHandler}>
        <div className="form-input">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" ref={this.emailElement} />
        </div>
        <div className="form-input">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" ref={this.passwordElement} />
        </div>
        <div className="form-actions">
          <button type="submit">
            {this.state.isLoggedIn ? "Login" : "Signup"}
          </button>
          <button type="button" onClick={this.switchHandler}>
            Switch to {!this.state.isLoggedIn ? "Login" : "Signup"}
          </button>
        </div>
      </form>
    );
  }
}

export default AuthPage;
