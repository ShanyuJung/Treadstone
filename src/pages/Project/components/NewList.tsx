import React, { useRef, useState } from "react";
import styled from "styled-components";
import { useOnClickOutside } from "../../../utils/hooks";
import { ReactComponent as closeIcon } from "../../../assets/close-svgrepo-com.svg";

const Wrapper = styled.div`
  width: 230px;
  flex-shrink: 0;
  margin: 0px 10px;
  height: fit-content;
`;

const TextArea = styled.textarea<{ isFocused: boolean }>`
  width: 100%;
  resize: none;
  cursor: pointer;
  font-family: "Poppins", sans-serif;
  padding: 5px 5px;
  font-size: 16px;
  height: ${(props) => (props.isFocused ? "" : "36px")};
  background-color: ${(props) => (props.isFocused ? "#fff" : "#ddd")};
  border-radius: 5px;
  border-color: ${(props) => (props.isFocused ? "#000" : "transparent")};
  overflow: hidden;

  &:hover {
    background-color: ${(props) => (props.isFocused ? "#fff" : "#ccc")};
  }
`;

const ButtonWrapper = styled.div<{ isShow: boolean }>`
  display: ${(props) => (props.isShow ? "flex" : "none")};
  gap: 10px;
  justify-content: space-between;
`;

const Button = styled.button`
  cursor: pointer;
  color: #fff;
  background-color: #0085d1;
  border: none;
  font-size: 16px;
  border-radius: 5px;
  margin: 0px;
  padding: 5px;
  font-weight: 600;

  &:hover {
    background-color: #0079bf;
  }
`;

const CloseButton = styled(closeIcon)`
  width: 30px;
  height: 30px;
  cursor: pointer;
  path {
    fill: #999;
  }

  &:hover {
    path {
      fill: #555;
    }
  }
`;

interface Props {
  onSubmit: (newListTitle: string) => void;
}

const NewList = ({ onSubmit }: Props) => {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const ref = useRef(null);
  const [isTextAreaFocus, setIsTextAreaFocus] = useState(false);

  const focusHandler = () => {
    setIsTextAreaFocus(true);
  };

  const clickOutsideHandler = () => {
    setIsTextAreaFocus(false);
    textRef.current?.blur();
  };

  const onSubmitHandler = (event: React.FormEvent) => {
    event.preventDefault();
    if (!textRef.current?.value) return;
    onSubmit(textRef.current?.value || "");
    textRef.current.value = "";
  };

  useOnClickOutside(ref, clickOutsideHandler);

  return (
    <Wrapper onFocus={focusHandler} ref={ref}>
      <form onSubmit={onSubmitHandler}>
        <TextArea
          placeholder="&#43; Add new list"
          ref={textRef}
          isFocused={isTextAreaFocus}
          required
        />
        <ButtonWrapper isShow={isTextAreaFocus}>
          <Button>Add New list</Button>
          <CloseButton onClick={clickOutsideHandler} />
        </ButtonWrapper>
      </form>
    </Wrapper>
  );
};

export default NewList;
