import React, { Component } from 'react';
import * as firebase from 'firebase/app';
import { mean } from 'lodash';

import './App.css';

// Add the Firebase services that you want to use
import 'firebase/database';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBdSL17rZ4MtYAfZu6GUIW8qINtrvpk0kc',
  authDomain: 'ta-im-for-lior-and-itay-aec74.firebaseapp.com',
  databaseURL:
    'https://ta-im-for-lior-and-itay-aec74-default-rtdb.firebaseio.com/',
  projectId: 'ta-im-for-lior-and-itay-aec74',
  storageBucket: 'ta-im-for-lior-and-itay-aec74.appspot.com',
  messagingSenderId: '801714873293',
  appId: '1:801714873293:web:beba2eee472d1d8b47da84',
  measurementId: 'G-MXLRVLJ6Q7',
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const mealPartsDBRef = database.ref('/mealParts2');

const storageRef = firebase.storage().ref();
const imagesFolder = storageRef.child('images');

const users = {
  'user-1': {
    name: 'אירית',
    image: '',
  },
  'user-2': {
    name: 'אילנית',
    image: '',
  },
  'user-3': {
    name: 'ארז',
    image: '',
  },
  'user-4': {
    name: 'אביב',
    image: '',
  },
  'user-5': {
    name: 'ליאור',
    image: '',
  },
  'user-6': {
    name: 'איתי',
    image: '',
  },
};

const COMMENT_MAX_LENGTH = 20;

class App extends Component {
  state = {
    currentUser: '',
    isAddNewDishModalOpen: false,
    currentMealPartIdForModal: '',
    isRateDishModalOpen: false,
    currentDishIdForModal: '',
    currentDishForModal: '',
    mealParts: {},
  };

  componentDidMount() {
    mealPartsDBRef.on('value', (snapshot) => {
      this.setState({ mealParts: snapshot.val() });
    });
  }

  createHandleUserChoiceCallback = (userId) => {
    return () => {
      this.setState({ currentUser: userId });
    };
  };

  createAddNewDishCallback = (mealPartId) => {
    return () => {
      this.setState({
        isAddNewDishModalOpen: true,
        currentMealPartIdForModal: mealPartId,
      });
    };
  };

  createRateDishCallback = (mealPartId, dishId, dish) => {
    return () => {
      this.setState({
        isRateDishModalOpen: true,
        currentMealPartIdForModal: mealPartId,
        currentDishIdForModal: dishId,
        currentDishForModal: dish,
      });
    };
  };

  closeAddNewDishModal = () => {
    this.setState({ isAddNewDishModalOpen: false });
  };

  closeRateDishModal = () => {
    this.setState({ isRateDishModalOpen: false });
  };

  addDish = (dish) => {
    const { mealParts, currentMealPartIdForModal } = this.state;

    mealPartsDBRef
      .child(`${currentMealPartIdForModal}/dishes/`)
      .push(dish)
      .then(() => {
        this.setState({
          currentMealPartIdForModal: '',
          isAddNewDishModalOpen: false,
        });
      });
  };

  setRating = (rating) => {
    const {
      mealParts,
      currentMealPartIdForModal,
      currentDishForModal,
      currentDishIdForModal,
      currentUser,
    } = this.state;

    mealPartsDBRef
      .child(
        `${currentMealPartIdForModal}/dishes/${currentDishIdForModal}/rating/${currentUser}`
      )
      .set(rating)
      .then(() => {
        this.setState({
          currentMealPartIdForModal: '',
          currentDishIdForModal: '',
          currentDishForModal: '',
          isRateDishModalOpen: false,
        });
      });
  };

  logout = () => {
    this.setState({ currentUser: '' });
  };

  render() {
    const {
      currentUser,
      mealParts,
      currentDishForModal,
      isAddNewDishModalOpen,
      isRateDishModalOpen,
    } = this.state;

    return (
      <div className='App'>
        <UsersList
          users={users}
          createHandleUserChoiceCallback={this.createHandleUserChoiceCallback}
          isVisible={!currentUser}
        />
        {currentUser && (
          <NavBar currentUser={users[currentUser]} logout={this.logout} />
        )}
        <MealPartsList
          mealParts={mealParts}
          isVisible={currentUser && !isAddNewDishModalOpen}
          currentUser={currentUser}
          createAddNewDishCallback={this.createAddNewDishCallback}
          createRateDishCallback={this.createRateDishCallback}
        />
        <AddNewDishModal
          isVisible={isAddNewDishModalOpen}
          closeModal={this.closeAddNewDishModal}
          addDish={this.addDish}
        />
        <RateDishModal
          isVisible={isRateDishModalOpen}
          dishToRate={currentDishForModal}
          closeModal={this.closeRateDishModal}
          setRating={this.setRating}
        />
      </div>
    );
  }
}

export default App;

const UsersList = ({ user, createHandleUserChoiceCallback, isVisible }) => {
  return (
    <div className={`users-list ${isVisible ? '' : 'hidden'}`}>
      <div className='title'>המון מזל טוב! מי אתה?</div>
      {Object.keys(users).map((userId) => (
        <User
          key={userId}
          user={users[userId]}
          userId={userId}
          onClick={createHandleUserChoiceCallback(userId)}
        />
      ))}
    </div>
  );
};

const User = ({ user, userId, onClick }) => {
  return (
    <div className='user-container' onClick={onClick}>
      <span className='user-name'>{user.name}</span>
    </div>
  );
};

const MealPartsList = ({
  mealParts,
  isVisible,
  currentUser,
  createAddNewDishCallback,
  createRateDishCallback,
}) => {
  return (
    <div className={`meal-parts-container ${isVisible ? 'visible' : ''}`}>
      {Object.keys(mealParts)
        .sort((aMealPartId, bMealPartId) => {
          return mealParts[aMealPartId].index - mealParts[bMealPartId].index;
        })
        .map((mealPartId) => {
          const mealPart = mealParts[mealPartId];
          return (
            <MealPartItem
              key={mealPartId}
              mealPart={mealPart}
              mealPartId={mealPartId}
              currentUser={currentUser}
              addNewDish={createAddNewDishCallback(mealPartId)}
              createRateDishCallback={createRateDishCallback}
            />
          );
        })}
    </div>
  );
};

const MealPartItem = ({
  mealPart,
  mealPartId,
  currentUser,
  addNewDish,
  createRateDishCallback,
}) => {
  // console.log('dish', dish);
  // console.log('dish.rating[userId].rating', dish.rating[userId].rating);
  return (
    <div className='meal-part-item'>
      <div className='header'>{mealPart.name}</div>
      <div className='content'>
        {mealPart.dishes &&
          Object.keys(mealPart.dishes).map((dishId) => {
            const dish = mealPart.dishes[dishId];
            let rating = dish.rating
              ? mean(
                  Object.keys(dish.rating).map(
                    (userId) => dish.rating[userId].ratingNumber
                  )
                )
              : 0;
            const didUserRatedThisDish = dish.rating
              ? Object.keys(dish.rating).includes(currentUser)
              : false;

            return (
              <div
                key={dishId}
                className='dish-container'
                onClick={createRateDishCallback(mealPartId, dishId, dish)}
              >
                <div
                  className='dish-post'
                  style={{ backgroundImage: `url(${dish.image})` }}
                >
                  {!didUserRatedThisDish && (
                    <div className='didnt-rate-flag'>טרם דירגת מנה זו</div>
                  )}
                  <div className='details'>
                    <span className='name'>{dish.name}</span>
                    <div className='rating-container'>
                      <span className='rating'>{rating.toFixed(1)}</span>
                      <div className='star'></div>
                    </div>
                  </div>
                </div>
                {dish.rating && (
                  <div className='users-rating-container'>
                    {Object.keys(dish.rating).map((userId) => {
                      console.log('dish', dish);
                      return (
                        <div key={`${userId}-rating`} className='user-rating'>
                          <div className='user-name'>{users[userId].name}</div>
                          <div className='separator'>-</div>
                          <div className='rating'>
                            <span>{dish.rating[userId].ratingNumber}</span>
                            <div className='star'></div>
                            <span className='comment'>
                              {dish.rating[userId].comment}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>
      <div className='add-new-dish-button' onClick={addNewDish}>
        + הוסף מנה
      </div>
    </div>
  );
};

class AddNewDishModal extends Component {
  state = {
    name: '',
    image: '',
    errorMessage: '',
    uploadProgress: '',
  };

  handleNameChange = (e) => {
    this.setState({ name: e.target.value });
  };

  handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const uploadTask = imagesFolder
      .child(`file.name_${new Date().toISOString()}`)
      .put(file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.setState({ uploadProgress: parseInt(progress), image: '' });
      },
      (e) => {
        console.log(e);
      },
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          this.setState({ image: downloadURL, uploadProgress: '' });
        });
      }
    );
  };

  addDish = () => {
    const { addDish } = this.props;
    const { name, image } = this.state;

    if (!name) {
      return this.setState({ errorMessage: 'אנא הזן שם למנה' });
    }

    if (!image) {
      return this.setState({ errorMessage: 'אנא צלם את המנה' });
    }

    this.setState({
      name: '',
      image: '',
      errorMessage: '',
    });

    addDish({ name, image, rating: {} });
  };

  closeModal = () => {
    const { closeModal } = this.props;

    this.setState({
      name: '',
      image: '',
      errorMessage: '',
    });

    closeModal();
  };

  render() {
    const { isVisible } = this.props;
    const { name, image, errorMessage, uploadProgress } = this.state;

    return (
      <div className={`add-new-dish-modal modal ${isVisible ? 'visible' : ''}`}>
        <div className='content'>
          <div className='header'>
            <span>הוסף מנה חדשה</span>
            <div className='cancel-button' onClick={this.closeModal}>
              X
            </div>
          </div>
          <div className='error-message'>{errorMessage}</div>
          <input
            type='text'
            placeholder='שם המנה'
            value={name}
            className='input'
            onChange={this.handleNameChange}
          />

          <label htmlFor='file' className='button'>
            הוסף תמונה (נא לצלם לרוחב)
          </label>
          <input
            id='file'
            className='input-file'
            type='file'
            accept='image/*'
            onChange={this.handleImageChange}
          />

          <div
            className='image-placeholder'
            style={{ backgroundImage: `url(${image})` }}
          >
            {uploadProgress !== '' && (
              <div className='progress'>{uploadProgress}%</div>
            )}
          </div>

          <div className='button submit-button' onClick={this.addDish}>
            הוסף מנה
          </div>
        </div>
      </div>
    );
  }
}

class RateDishModal extends Component {
  state = {
    rating: 0,
    comment: '',
  };

  closeModal = () => {
    const { closeModal } = this.props;

    this.setState({ rating: 0 });

    closeModal();
  };

  createSetRatingCallback = (rating) => {
    return () => {
      this.setState({ rating });
    };
  };

  setRating = () => {
    const { setRating } = this.props;
    const { rating, comment } = this.state;

    if (rating !== 0) {
      this.setState({ rating: 0, comment: '' });
      setRating({ ratingNumber: rating, comment });
    }
  };

  handleCommentsChange = (e) => {
    const commentContent = e.target.value;

    if (commentContent.length > COMMENT_MAX_LENGTH) {
      return;
    }

    this.setState({ comment: commentContent });
  };

  render() {
    console.log('this.state.comment', this.state.comment);
    const { isVisible, dishToRate } = this.props;
    const { rating } = this.state;

    return (
      <div className={`rate-dish-modal modal ${isVisible ? 'visible' : ''}`}>
        <div className='content'>
          <div className='header'>
            <span>דרג מנה</span>
            <div className='cancel-button' onClick={this.closeModal}>
              X
            </div>
          </div>

          <div className='dish-name'>{dishToRate.name}</div>
          <div
            className='dish-image'
            style={{ backgroundImage: `url(${dishToRate.image})` }}
          ></div>

          <div className='rating-container'>
            <div className='title'>איך המנה לדעתך?</div>

            <div className='stars-container'>
              <div
                className={`star ${rating >= 1 ? 'selected' : ''}`}
                onClick={this.createSetRatingCallback(1)}
              ></div>
              <div
                className={`star ${rating >= 2 ? 'selected' : ''}`}
                onClick={this.createSetRatingCallback(2)}
              ></div>
              <div
                className={`star ${rating >= 3 ? 'selected' : ''}`}
                onClick={this.createSetRatingCallback(3)}
              ></div>
              <div
                className={`star ${rating >= 4 ? 'selected' : ''}`}
                onClick={this.createSetRatingCallback(4)}
              ></div>
              <div
                className={`star ${rating >= 5 ? 'selected' : ''}`}
                onClick={this.createSetRatingCallback(5)}
              ></div>
            </div>
          </div>

          <input
            type='text'
            placeholder={`הערות (עד ${COMMENT_MAX_LENGTH} תווים)`}
            className='input'
            value={this.state.comment}
            onChange={this.handleCommentsChange}
          />

          <div
            className={`submit-button ${rating === 0 ? 'disabled' : ''}`}
            onClick={this.setRating}
          >
            דרג
          </div>
        </div>
      </div>
    );
  }
}

const NavBar = ({ currentUser, logout }) => {
  return (
    <div className='nav-bar'>
      <div className='logo-container'>TaimLi</div>
      <div className='user-details-container'>
        <span>שלום {currentUser.name}, בתאבון!</span>
        <div className='button logout-button' onClick={logout}>
          התנתק
        </div>
      </div>
    </div>
  );
};
