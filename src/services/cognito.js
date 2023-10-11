var AmazonCognitoIdentity = require("amazon-cognito-identity-js");
var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
require("dotenv").config();
let Auth = require("./amplify");
var poolData = {
  UserPoolId: process.env.USER_POOL_ID, // Your user pool id here
  ClientId: process.env.USER_POOL_WEB_CLIENT_ID, // Your client id here
};

var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const createUserWithUsernameAndPassword = ({
  username,
  email,
  password,
  given_name,
  family_name,
}) => {
  var attributeList = [];
  var dataEmail = {
    Name: "email",
    Value: email,
  };
  var dataFamilyName = {
    Name: "family_name",
    Value: family_name,
  };
  var dataGivenName = {
    Name: "given_name",
    Value: given_name,
  };
  var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(
    dataEmail
  );
  var attributeFamilyName = new AmazonCognitoIdentity.CognitoUserAttribute(
    dataFamilyName
  );
  var attributeGivenName = new AmazonCognitoIdentity.CognitoUserAttribute(
    dataGivenName
  );

  attributeList.push(attributeEmail);
  attributeList.push(attributeFamilyName);
  attributeList.push(attributeGivenName);
  userPool.signUp(
    username,
    password,
    attributeList,
    null,
    function (err, result) {
      if (err) {
        alert(err.message || JSON.stringify(err));
        // throw new Error(err.message || JSON.stringify(err));
      }
      //   var cognitoUser = result.user;

      //   console.log("user name is " + cognitoUser.getUsername());
      //   cognitoUser.getUserAttributes((err, attributes) => {
      //     if (err) {
      //       throw new Error(err.message || JSON.stringify(err));
      //     }
      //     for (const attribute of attributes) {
      //       if (attribute.getName() === "sub") {
      //         const userId = attribute.getValue();
      //         console.log("User ID:", userId);
      //         break;
      //       }
      //     }
      //   });
    }
  );
};

async function createUserWithUsernameAndPasswordAmplify({
  username,
  email,
  password,
  given_name,
  family_name,
}) {
  try {
    const { user } = await Auth.signUp({
      username,
      password,
      attributes: {
        email,
        given_name, // optional
        family_name, // optional - E.164 number convention
        // other custom attributes
      },
      autoSignIn: {
        // optional - enables auto sign in after user is confirmed
        enabled: false,
      },
    });
    console.log(user);
  } catch (error) {
    console.log("error signing up:", error);
  }
}

async function confirmUserRegistrationAmplify({ username, confirmationCode }) {
  try {
    await Auth.confirmSignUpY(username, "" + confirmationCode);
  } catch (error) {
    console.log("error confirming sign up", error);
  }
}

const confirmUserRegistration = ({ username, confirmationCode }) => {
  var userData = {
    Username: username,
    Pool: userPool,
  };

  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.confirmRegistration(
    "" + confirmationCode,
    true,
    function (err, result) {
      if (err) {
        console.log(err.message || JSON.stringify(err));
        return;
      }
      console.log("call result: " + result);
    }
  );
};

module.exports = {
  createUserWithUsernameAndPassword,
  createUserWithUsernameAndPasswordAmplify,
  confirmUserRegistration,
  confirmUserRegistrationAmplify,
};
