import { useNavigate, Navigate } from "react-router-dom";
import { fetchToken, setToken } from "../Auth";
import { useState } from "react";
import api from "../axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  CircularProgress,
  Box
} from "@material-ui/core";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const registration = () => {
    localStorage.removeItem("temitope");
    navigate("/registration");
  };

  if (fetchToken()) {
    return <Navigate to="/users" />;
  }

  const loginCheck = () => {
    if (password === "" || email === "") {
      setErrorMessage("Please, fill in the input fields");
      return errorMessage;
    } else {
      setIsLoading(true);
      api
        .post("/login", { email: email, password: password })
        .then(function (response) {
          if (response.status === 200) {
            setToken(response.data.access_token);
            navigate("/users");
          }
        })
        .catch(function (error) {
          if (error.response.status === 401) {
            setErrorMessage("Incorrect username or password. Please, try again");
          } else if (error.response.status === 403) {
            setErrorMessage("This user is blocked");
          } else {
            setErrorMessage("An error occurred. Please try again later.");
          }
        })
        .finally(() => setIsLoading(false));
    }
  };

    return (
        <Container component="main" maxWidth="xs">
            <Typography component="h1" variant="h5">
                Sign In
            </Typography>
            <Box sx={{ mb: 3 }}>
                <Typography component="span" variant="body1">
                <b>Sign in and enjoy the service</b>
                </Typography>
            </Box>
            <Box
                component="form"
                noValidate
                onSubmit={(e) => {
                e.preventDefault();
                loginCheck();
                }}
            >
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className="signButton"
                    >
                    {isLoading ? <CircularProgress size={24} /> : "Sign In"}
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body1" sx={{ display: "inline" }}>
                        Don't have an account?
                    </Typography>{" "}
                    <Link component="button" onClick={registration}>
                        Sign Up
                    </Link>
                </Grid>
            </Grid>
            </Box>
            {errorMessage && (
                <Typography variant="body2" color="error">
                {errorMessage}
                </Typography>
            )}
        </Container>
    );
}
