import { redirect } from "next/navigation";

// The canonical faculty signup is now at /signup
// Redirect any direct links here to the correct page
export default function SignupFacultyRedirect() {
  redirect("/signup");
}
