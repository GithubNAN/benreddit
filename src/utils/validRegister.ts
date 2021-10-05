import { UserInput } from "../resolvers/UserInput";

export const validateRegister = ({ email, username, password }: UserInput) => {
  // validation of registering username
  if (!email.includes("@")) {
    return [
      {
        field: "email",
        message: "invalid email",
      },
    ];
  }

  if (username.length <= 2) {
    return [
      {
        field: "username",
        message: "username length must be longer than 2 characters",
      },
    ];
  }

  if (username.includes("@")) {
    return [
      {
        field: "username",
        message: "don't put @ in username",
      },
    ];
  }

  // Validation of registering password
  if (password.length <= 2) {
    return [
      {
        field: "password",
        message: "password length must be longer than 2 characters",
      },
    ];
  }

  return null;
};
