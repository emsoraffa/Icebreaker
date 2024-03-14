import { useEffect, useState } from "react";
import { Activity } from "../types/types";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import "../style/ActivitiesStyles.css"
function ActivityCard(params: Activity) {
  const [styleClass, setClass] = useState('activity');
  const [expandMode, toggleExpand] = useState(false);
  const [isLoggedIn, setLoggedIn] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<String[]>([]);
  const [value, setValue] = useState<boolean>(false);

  const navigate = useNavigate()

  const retrieveFavorites = async () => {
    const userId = sessionStorage.getItem("user_id");
    if (!userId) {
      return;
    }
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setFavorites(docSnap.data().favorites);
    }
    else {
      console.log("No such document!")
    }
  }

  const updateFavorites = async () => {
    retrieveFavorites();
    const userId = sessionStorage.getItem("user_id");
    if (!userId) {
      return;
    }
    const userRef = doc(db, "users", userId);

    await updateDoc(userRef, {
      favorites: [params.id, ...favorites]
    });
  }

  const deleteFavorites = async () => {
    retrieveFavorites();
    const userId = sessionStorage.getItem("user_id");
    if (!userId) {
      return;
    }
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      favorites: favorites.filter((activityId) => activityId !== params.id)
    });
  }


  useEffect(() => {
    setLoggedIn(sessionStorage.getItem("user_id") !== "" && sessionStorage.getItem("user_id") !== null)
    retrieveFavorites();
  }, [navigate])

  useEffect(() => {
    if (favorites.includes(params.id)) {
      setValue(true);
    }
  }, [favorites])

  const handleButtonClick = () => {
    navigate("/" + params.id);
  }

  const handleChange = () => {
    if (!value) {
      updateFavorites();
    } else {
      deleteFavorites();
    }
    setValue(!value)
  }

  const handleReviewButton = () => {
    navigate("/create_review/" + params.id);
  }
  return (
    <div className={styleClass} >
      <div className="activity_element" onClick={handleButtonClick}>
        <h3>{params.title}</h3>
        <p id="user_text">Opprettet av: {params.creator.name}</p>
        {expandMode && <p>Beskrivelse: {params.description}</p>}
        <p id="rating_text">Rating: {params.averageRating}</p>
      </div>
      {isLoggedIn &&
        <div className="activity_actions" >
          <button onClick={handleReviewButton}>Vurder</button>
          <button>Rapporter</button>
          <input checked={value} onChange={handleChange} type="checkbox" className="activity_checkbox" />
        </div>
      }
    </div>
  );
}

export default ActivityCard;
