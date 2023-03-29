import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from "react-router"
import api from '../axios';
import { Container, Typography, Box, TextField, Button, Link } from '@material-ui/core';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [errorMessage, setErrorMessage] = useState("");

  const handleLoginClick = () => {
    localStorage.removeItem('temitope');
    navigate('/login');
  };

  const onSubmit = data => {
    api.post("/registration", { name: data.username, email: data.email, password: data.password })
      .then(res => {
        if (res.data === "OK") {
          alert("Success");
          navigate("/login");
        }
      })
      .catch(function (error) {
        console.log(error, 'error');
        setErrorMessage(`Email "${data.email}" already exists, please choose another one.`)
      });
  }

  return (
        <Container component="main" maxWidth="xs">
            <Box minHeight={940} marginTop={2}>
                <Typography component="h1" variant="h5">
                    Sign Up
                </Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Typography component="span" variant="body1">
                        Sign up to enjoy the service
                    </Typography>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        {...register("username", { required: true, minLength: 3 })}
                        error={Boolean(errors.username)}
                        helperText={
                        errors.username?.type === "required"
                            ? "Username is required"
                            : errors.username?.type === "minLength"
                            ? "Username must be longer than 3 characters"
                            : null
                        }
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        {...register("email", { required: true, minLength: 5 })}
                        error={Boolean(errors.email)}
                        helperText={
                        errors.email?.type === "minLength"
                            ? "Email must be longer than 5 characters"
                            : null
                        }
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        {...register("password", { required: true, minLength: 1 })}
                        error={Boolean(errors.password)}
                        helperText={
                        errors.password?.type === "minLength"
                            ? "Password should be at least 1 character"
                            : null
                        }
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className="signButton"
                    >
                        Sign Up
                    </Button>
                    <Box mt={2}>
                        {errorMessage && (
                        <Typography variant="body2" color="error">
                            {errorMessage}
                        </Typography>
                        )}
                    </Box>
                    <Typography variant="body1" sx={{ display: "inline" }}>
                        Already have an account?{" "}
                    </Typography>
                    <Link component="button" onClick={handleLoginClick}>
                        Sign In
                    </Link>
                </form>
            </Box>
        </Container>
    )
}