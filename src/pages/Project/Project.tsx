import styled from "styled-components";
import PrivateRoute from "../../components/route/PrivateRoute";
import List from "./components/List";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DragStart,
} from "react-beautiful-dnd";
import { useEffect, useState } from "react";
import produce from "immer";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import NewList from "./components/NewList";
import { v4 as uuidv4 } from "uuid";
import {
  useNavigate,
  useParams,
  LoaderFunctionArgs,
  useLoaderData,
} from "react-router-dom";
import Modal from "../../components/modal/Modal";
import CardDetail from "./components/detail/CardDetail";
import ProjectSidebar from "./components/ProjectSidebar";
import OnlineMembers from "./components/OnlineMembers";
import Swal from "sweetalert2";
import { useAuth } from "../../contexts/AuthContext";
import CardFilter from "./components/CardFilter";
import {
  ListInterface,
  MemberInterface,
  ProjectInterface,
  WorkspaceInterface,
} from "../../types";

const Container = styled.div`
  display: flex;
  flex-wrap: nowrap;
`;

const BorderWrapper = styled.div<{ isShowSidebar: boolean }>`
  height: calc(100vh - 70px);
  flex-grow: 1;
  margin-left: ${(props) => (props.isShowSidebar ? "260px" : "15px")};
  transition: margin 0.3s;
  overflow: hidden;
`;

const SubNavbar = styled.div<{ isShowSidebar: boolean }>`
  width: ${(props) =>
    props.isShowSidebar ? "calc(100vw - 260px)" : "calc(100% - 15px)"};
  height: 40px;
  padding: 0px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  background-color: #fff;
  z-index: 9;
  transition: width 0.3s;
  gap: 20px;
`;

const TitleWrapper = styled.div`
  font-size: 20px;
  font-weight: bolder;
  flex-grow: 1;
`;

const Wrapper = styled.div`
  margin-top: 40px;
  width: 100%;
`;

const ListWrapper = styled.div`
  padding: 10px 20px 10px 20px;
  display: flex;
  /* width: fit-content; */
  overflow: scroll;
  height: calc(100vh - 70px - 40px);
`;

const ShowSidebarButton = styled.button<{ isShowSidebar: boolean }>`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 900;
  color: #658da6;
  top: 80px;
  left: ${(props) => (props.isShowSidebar ? "245px" : "0px")};
  height: 30px;
  width: 30px;
  background-color: #f2f2f2;
  border-color: #658da6;
  border-radius: 50%;
  cursor: pointer;
  z-index: 12;
  transition: left 0.3s;
`;

const ErrorText = styled.div`
  margin-top: 40px;
  font-size: 20px;
  font-weight: 600;
  width: 100%;
  text-align: center;
`;

export const firstRenderProjectHandler = async ({
  params,
}: LoaderFunctionArgs) => {
  if (!params.projectID) return null;
  try {
    const projectRef = doc(db, "projects", params.projectID);
    const docSnap = await getDoc(projectRef);
    if (docSnap.exists()) {
      const response = docSnap.data();
      return response;
    }
    Swal.fire("Error", "Workspace is not exist!", "warning");
    return null;
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "Missing or insufficient permissions.") {
        Swal.fire(
          "Authentication Error!",
          "Please login before start your work.",
          "warning"
        );
        return;
      }
    }
    Swal.fire(
      "Failed to connect server!",
      "Please check your internet connection and try again later",
      "warning"
    );
  }
};

const Project = () => {
  const [isExist, setIsExist] = useState<boolean | undefined>(undefined);
  const [lists, setLists] = useState<ListInterface[]>([]);
  const [project, setProject] = useState<ProjectInterface | undefined>(
    undefined
  );
  const [members, setMembers] = useState<MemberInterface[]>([]);
  const [memberIDs, setMemberIDs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowSidebar, setIsShowSidebar] = useState(true);
  const navigate = useNavigate();
  const { workspaceID, projectID, cardID } = useParams();
  const response = useLoaderData() as ProjectInterface;
  const { currentUser } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);

  const updateDataHandler = async (newList: ListInterface[]) => {
    if (!projectID || isLoading) return;

    try {
      setIsLoading(true);
      const projectRef = doc(db, "projects", projectID);
      await updateDoc(projectRef, { lists: newList });
    } catch {
      Swal.fire("Something went wrong!", "Please try again later", "warning");
    }
    setIsLoading(false);
  };

  const isDraggingHandler = async ({ draggableId, type }: DragStart) => {
    if (!projectID || isLoading || !currentUser) return;
    const projectRef = doc(db, "projects", projectID);
    if (type === "BOARD") {
      const draggingObj = {
        listID: draggableId,
        displayName: currentUser.displayName,
      };
      await updateDoc(projectRef, { draggingLists: arrayUnion(draggingObj) });
    }
    if (type === "LIST") {
      const draggingObj = {
        cardID: draggableId,
        displayName: currentUser.displayName,
      };
      await updateDoc(projectRef, { draggingCards: arrayUnion(draggingObj) });
    }
  };

  const isDroppedHandler = async (draggableId: string, type: string) => {
    if (!projectID || isLoading || !currentUser) return;
    const projectRef = doc(db, "projects", projectID);
    if (type === "BOARD") {
      const draggingObj = {
        listID: draggableId,
        displayName: currentUser.displayName,
      };
      await updateDoc(projectRef, { draggingLists: arrayRemove(draggingObj) });
    }
    if (type === "LIST") {
      const draggingObj = {
        cardID: draggableId,
        displayName: currentUser.displayName,
      };
      await updateDoc(projectRef, { draggingCards: arrayRemove(draggingObj) });
    }
  };

  const onDragEndHandler = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    isDroppedHandler(draggableId, result.type);
    if (!destination || isLoading) return;

    try {
      if (result.type === "BOARD") {
        const newLists = produce(lists, (draftState) => {
          const [newOrder] = draftState.splice(source.index, 1);
          draftState.splice(destination.index, 0, newOrder);
        });
        setLists(newLists);
        updateDataHandler(newLists);
      }

      if (result.type === "LIST") {
        const newLists = produce(lists, (draftState) => {
          const prevListIndex = draftState.findIndex((item) => {
            return item.id === source.droppableId;
          });
          const newListIndex = draftState.findIndex((item) => {
            return item.id === destination.droppableId;
          });

          const [newOrder] = draftState[prevListIndex].cards.splice(
            source.index,
            1
          );
          draftState[newListIndex].cards.splice(destination.index, 0, newOrder);
        });
        setLists(newLists);
        updateDataHandler(newLists);
      }
    } catch {
      Swal.fire("Something went wrong!", "Please, try again later.", "warning");
    }
  };

  const newCardHandler = (newCardTitle: string, parentID: string) => {
    const newId = uuidv4();
    const newCard = { id: newId, title: newCardTitle };
    const newLists = produce(lists, (draftState) => {
      const listIndex = lists.findIndex((item) => item.id === parentID);
      draftState[listIndex].cards.push(newCard);
    });

    updateDataHandler(newLists);
  };

  const newListHandler = (newListTitle: string) => {
    const newId = uuidv4();
    const newList = { id: newId, title: newListTitle, cards: [] };
    const newLists = produce(lists, (draftState) => {
      draftState.push(newList);
    });

    updateDataHandler(newLists);
  };

  const deleteCardHandler = async (targetCardID: string) => {
    const parentIndex = lists.findIndex((list) => {
      return list.cards.find((card) => card.id === targetCardID);
    });
    const targetIndex = lists[parentIndex].cards.findIndex((card) => {
      return card.id === targetCardID;
    });

    const newLists = produce(lists, (draftState) => {
      draftState[parentIndex].cards.splice(targetIndex, 1);
    });

    updateDataHandler(newLists);
  };

  const deleteListHandler = (targetListID: string) => {
    const newLists = produce(lists, (draftState) => {
      const deleteListIndex = draftState.findIndex(
        (list) => list.id === targetListID
      );
      draftState.splice(deleteListIndex, 1);
    });

    updateDataHandler(newLists);
  };

  const moveAllCardsHandler = (curListID: string, targetListID: string) => {
    const newList = produce(lists, (draftState) => {
      const curIndex = draftState.findIndex((list) => list.id === curListID);
      const targetIndex = draftState.findIndex(
        (list) => list.id === targetListID
      );
      draftState[curIndex].cards = [];
      draftState[targetIndex].cards.push(...lists[curIndex].cards);
    });

    updateDataHandler(newList);
    const targetList = lists.find((list) => list.id === targetListID);
    Swal.fire("Succeed!", `Move all cards to ${targetList?.title}`, "success");
  };

  const onCloseHandler = () => {
    navigate(`/workspace/${workspaceID}/project/${projectID}`);
  };

  useEffect(() => {
    const getMembersHandler = async () => {
      if (!project) return;
      const workspaceRef = collection(db, "workspaces");
      const q = query(
        workspaceRef,
        where("projects", "array-contains-any", [
          { id: projectID, title: project?.title },
        ])
      );
      const querySnapshot = await getDocs(q);
      const emptyWorkspaceArr: WorkspaceInterface[] = [];
      const curWorkspaces = produce(emptyWorkspaceArr, (draftState) => {
        querySnapshot.forEach((doc) => {
          const docData = doc.data() as WorkspaceInterface;
          draftState.push(docData);
        });
      });
      const usersRef = collection(db, "users");
      const userQ = query(
        usersRef,
        where("uid", "in", curWorkspaces[0].members)
      );
      const userQuerySnapshot = await getDocs(userQ);
      const emptyMemberArr: MemberInterface[] = [];
      const curMembers = produce(emptyMemberArr, (draftState) => {
        userQuerySnapshot.forEach((doc) => {
          const docData = doc.data() as MemberInterface;
          draftState.push(docData);
        });
      });
      setMemberIDs(curWorkspaces[0].members);
      setMembers(curMembers);
    };

    getMembersHandler();
  }, [project]);

  useEffect(() => {
    if (!keyword.trim()) {
      setIsFiltered(false);
      return;
    }
    setIsFiltered(true);
  }, [keyword]);

  useEffect(() => {
    if (!response) {
      setIsExist(false);
      return;
    }
    setIsExist(true);
    setProject(response);
    setLists(response.lists);
  }, [response]);

  useEffect(() => {
    if (!projectID) return;
    const projectRef = doc(db, "projects", projectID);
    const unsubscribe = onSnapshot(projectRef, (snapshot) => {
      if (snapshot.data()) {
        setIsExist(true);
        const newProject = snapshot.data() as ProjectInterface;
        setProject(newProject);
        setLists(snapshot.data()?.lists);
      } else {
        setIsExist(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const renderProjectBoard = () => {
    return (
      <Droppable
        droppableId={projectID || "default"}
        direction="horizontal"
        type="BOARD"
      >
        {(provided) => (
          <Wrapper {...provided.droppableProps} ref={provided.innerRef}>
            <ListWrapper>
              {lists.length > 0 &&
                lists.map((list, index) => {
                  return (
                    <Draggable
                      key={`draggable-${list.id}`}
                      draggableId={list.id}
                      index={index}
                      isDragDisabled={
                        isFiltered ||
                        project?.draggingLists?.some(
                          (draggingList) => draggingList.listID === list.id
                        ) ||
                        false
                      }
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          data-is-dragging={
                            snapshot.isDragging && !snapshot.isDropAnimating
                          }
                        >
                          <List
                            title={list.title}
                            cards={list.cards}
                            key={list.id}
                            newCardHandler={newCardHandler}
                            id={list.id}
                            tags={project?.tags || undefined}
                            members={members}
                            draggingLists={project?.draggingLists || undefined}
                            draggingCards={project?.draggingCards || undefined}
                            deleteList={deleteListHandler}
                            lists={lists}
                            moveAllCardsHandler={moveAllCardsHandler}
                            isFilter={isFiltered}
                            keyword={keyword}
                          />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
              {provided.placeholder}
              <NewList onSubmit={newListHandler} />
            </ListWrapper>
          </Wrapper>
        )}
      </Droppable>
    );
  };

  return (
    <PrivateRoute>
      <>
        {cardID !== undefined && (
          <Modal onClose={onCloseHandler}>
            {lists.length > 0 ? (
              <CardDetail
                listsArray={[...lists]}
                tags={project?.tags || undefined}
                members={members}
                onDelete={deleteCardHandler}
                onClose={onCloseHandler}
              />
            ) : null}
          </Modal>
        )}
        <Container>
          <ProjectSidebar isShow={isShowSidebar} />
          <ShowSidebarButton
            isShowSidebar={isShowSidebar}
            onClick={() => {
              setIsShowSidebar((prevIsShowSidebar) => !prevIsShowSidebar);
            }}
          >
            {isShowSidebar ? "<" : ">"}
          </ShowSidebarButton>
          <BorderWrapper isShowSidebar={isShowSidebar}>
            <SubNavbar isShowSidebar={isShowSidebar}>
              <TitleWrapper>
                {project !== undefined && project.title}
              </TitleWrapper>
              <CardFilter keyword={keyword} setKeyword={setKeyword} />
              <OnlineMembers memberIDs={memberIDs} />
            </SubNavbar>
            <DragDropContext
              onDragEnd={onDragEndHandler}
              onDragStart={isDraggingHandler}
            >
              {isExist && renderProjectBoard()}
              {isExist === false && (
                <ErrorText>Project is not exist.</ErrorText>
              )}
            </DragDropContext>
          </BorderWrapper>
        </Container>
      </>
    </PrivateRoute>
  );
};

export default Project;
