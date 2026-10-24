// Turns Firebase error codes into messages a farmer can understand.
export function friendlyAuthError(error) {
  switch (error?.code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Try logging in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Wrong email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "No internet connection. Please try again when you are online.";
    case "PERMISSION_DENIED":
      return "Could not save your profile. The database rules may not be published.";
    default:
      if (error?.message?.includes("PERMISSION_DENIED")) {
        return "Could not save your profile. The database rules may not be published.";
      }
      return "Something went wrong. Please try again.";
  }
}