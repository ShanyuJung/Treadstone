import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { ReactComponent as TrashIcon } from "../../../../assets/trash-svgrepo-com.svg";
import { ReactComponent as ToDoIcon } from "../../../../assets/checkbox-svgrepo-com.svg";
import DropdownButton from "../../../../components/button/DropdownButton";

const Wrapper = styled.div`
  width: 250px;
  padding: 10px;
  display: flex;
  flex-direction: column;
`;

const ListTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #666;
`;

const ButtonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const TrashLogo = styled(TrashIcon)`
  height: 16px;
  width: 16px;
  margin-right: 10px;

  path {
    fill: #777;
  }
`;

const ButtonListItem = styled.div`
  height: 30px;
`;

const CardFeatureButton = styled.button`
  height: 30px;
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 16px;
  padding: 5px 10px;
  border: none;
  color: #666;
  background-color: #ddd;
  cursor: pointer;

  &:hover {
    color: #111;
    background-color: #ccc;
  }
`;

const ToDoLogo = styled(ToDoIcon)`
  height: 16px;
  width: 16px;
  margin-right: 10px;

  path {
    fill: #777;
  }
`;

const DropdownChildrenWrapper = styled.div`
  margin-top: 5px;
  width: 100%;
  background-color: #fff;
`;

const NewToDoCard = styled.div`
  height: 400px;
`;

interface Props {
  onDelete: (targetCardID: string) => void;
}

const CardDetailSideBar: React.FC<Props> = ({ onDelete }) => {
  const { id, cardId } = useParams();
  const navigate = useNavigate();

  const addToDoListHandler = () => {};

  const checkDeleteCardHandler = () => {
    const r = window.confirm("Check to delete selected card");
    if (r === true) {
      navigate(`/project/${id}`);
      onDelete(cardId || "");
    }
  };

  return (
    <Wrapper>
      <ListTitle>Edit Card</ListTitle>
      <ButtonList>
        <DropdownButton logo={<ToDoLogo />} text={"Add to do list"}>
          <DropdownChildrenWrapper>
            <NewToDoCard>123</NewToDoCard>
          </DropdownChildrenWrapper>
        </DropdownButton>
        <ButtonListItem>
          <CardFeatureButton onClick={checkDeleteCardHandler}>
            <TrashLogo />
            Delete Card
          </CardFeatureButton>
        </ButtonListItem>
      </ButtonList>
    </Wrapper>
  );
};

export default CardDetailSideBar;
