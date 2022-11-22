import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import AuthInput from "../../components/input/AuthInput";
import LoginRoute from "../../components/route/LoginRoute";
import { useAuth } from "../../contexts/AuthContext";

const Wrapper = styled.div`
  padding: 100px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Card = styled.div`
  width: 450px;
  padding: 20px;
  border: 1px #ccc solid;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const SubmitButton = styled.button`
  width: 80%;
  font-size: 20px;
  color: #fff;
  border: none;
  background-color: #0085d1;
  border: none;
  margin: 20px;
  border-radius: 5px;
  padding: 8px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #0079bf;
  }
`;

const StyledLink = styled(Link)`
  color: #0d6efd;
  font-size: 16px;
`;

const Text = styled.div`
  margin-top: 10px;
  color: #000;
`;

const ErrorMessageWrapper = styled.div`
  border: 1px solid #e74c3c;
  border-radius: 5px;
  color: #e74c3c;
  width: 80%;
  text-align: center;
  font-size: 16px;
  min-height: 40px;
  line-height: 40px;
  background-color: #fadbd8;
`;

const MessageWrapper = styled.div`
  border: 1px solid #196f3d;
  border-radius: 5px;
  color: #196f3d;
  width: 80%;
  text-align: center;
  font-size: 16px;
  min-height: 40px;
  line-height: 40px;
  background-color: #d5f5e3;
`;

const ForgotPassword = () => {
  const emailRef = useRef<HTMLInputElement | null>(null);

  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  const submitHandler = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (isLoading) return;

    const email = emailRef.current?.value || "";

    try {
      setErrorMessage("");
      setMessage("");
      setIsLoading(true);
      await resetPassword(email);
      setMessage("Please, check your inbox for password reset letter.");
    } catch {
      setErrorMessage("Failed to reset password.");
    }
    setIsLoading(false);
  };

  return (
    <LoginRoute>
      <Wrapper>
        <Card>
          {message === "" ? <></> : <MessageWrapper>{message}</MessageWrapper>}
          {errorMessage === "" ? (
            <></>
          ) : (
            <ErrorMessageWrapper>{errorMessage}</ErrorMessageWrapper>
          )}
          <Form onSubmit={submitHandler}>
            <AuthInput labelText="Email" type="email" ref={emailRef} />
            <SubmitButton disabled={isLoading}>Send Reset email</SubmitButton>
          </Form>
          <StyledLink to="/login">Login</StyledLink>
        </Card>
        <Text>
          Don't have an account? <StyledLink to="/signup"> Signup</StyledLink>
        </Text>
      </Wrapper>
    </LoginRoute>
  );
};

export default ForgotPassword;
