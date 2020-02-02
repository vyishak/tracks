import createDataContext from './createDataContext';
import trackerApi from '../api/tracker';
import { AsyncStorage } from 'react-native';
import { navigate } from '../navigationRef';

const authReducer = (state, action) => {
    switch (action.type) {
        case 'add_error':
            return { ...state, errorMessage: action.payload };
        case 'signup':
            return { errorMessage: '', token: action.payload };
        case 'signin':
            return { errorMessage: '', token: action.payload };    
        case 'clear_error_message':
            return { ...state, errorMessage: '' };
        case 'signout':
            return { token: null, errorMessage: '' };
        default:
            return state;
    }
};

const tryLocalSignin = dispatch => async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        dispatch({ type: 'signin', payload: token });
        navigate('TrackList');
    } else {
        navigate('Signup');
    }
};

const clearErrorMessage = dispatch => () => {
    dispatch({ type: 'clear_error_message' });
};

const signup = (dispatch) => {
    return async ({ email, password }) => {
        // make an api reuest to sign up with that email and password
        try {
            const response = await trackerApi.post('/signup', { email, password });
            await AsyncStorage.setItem('token', response.data.token);
            dispatch({ type: 'signup', payload: response.data.token })
        
            navigate('TrackList');
        } catch (err) {
            dispatch({ type: 'add_error', payload: 'something went wrong with sign up'})
        }
        // if we sign up, modify our state, and say that we are authenticated !

        // if siginig up fails, we need to reflect an error somehow
    };
};

const signin = (dispatch) => {
    return async ({ email, password }) => {
        //try to sign in
        // handle succes by updating state
        // handle failure by showing error message
        try {
            const response = await trackerApi.post('/signin', { email, password });
            await AsyncStorage.setItem('token', response.data.token);
            dispatch({ type: 'signin', payload: response.data.token });
            navigate('TrackList');
        } catch (err) {
            dispatch({
                type: 'add_error',
                payload: 'Somethig went wrong with sign in'
            });
        }

    };
};

const signout = (dispatch) => {
    return async () => {
        await AsyncStorage.removeItem('token');
        dispatch({ type: 'signout' });
        navigate('loginFlow');
    };
};

export const { Provider, Context } = createDataContext(
    authReducer,
    { signin, signout, signup, clearErrorMessage, tryLocalSignin },
    { token: null, errorMessage: '' }
);