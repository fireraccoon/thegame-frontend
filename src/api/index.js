// Service to connect to thegame api server
// Handles authentication and storage of JWT

import config from '../config'

import router from '../router'
import axios from 'axios'


const API_URL = config.HOST + '/api'

const LOGIN_URL = API_URL + '/users/login'
const REGISTER_URL = API_URL + '/users/register'

const CREATE_GAME_URL = API_URL + '/games/new'
const GET_GAMES_URL = API_URL + '/games'
const GET_GAME_URL = API_URL + '/games/:id'
const GET_GAME_LEADERBOARD = API_URL + '/games/:id/leaderboard'
const UPDATE_GAME_URL = API_URL + '/games/:id'
const DELETE_GAME_URL = API_URL + '/games/:id'

const GET_CHALLENGES_URL = API_URL + '/games/:id/challenges'
const CREATE_CHALLENGE_URL = API_URL + '/games/:id/challenges/new'
const DELETE_CHALLENGE_URL = API_URL + '/challenges/:id'
const GET_CHALLENGE_URL = API_URL + '/challenges/:id'
const COMPLETE_CHALLENGE_URL = API_URL + '/challenges/:id/complete'
const CANCEL_CHALLENGE_URL = API_URL + '/challenges/:id/cancel'
const COMPLETE_CHALLENGE_BATCH_URL = API_URL + '/challenges/complete'
const GET_NEWS_URL = API_URL + '/events'

const GET_USERS_URL = API_URL + '/users'






var api =  {

  // User object will let us check authentication status
  user: {
    username: '',
    authenticated: false
  },

  // Intercept requests to see if token is still valid or not
  responseInterceptor: {

      // SUCCESS
    onSuccess: function (response) {
        return response;
    },

    // ERROR
    onError: function(error) {
      // Unauthorized access
      if(error.response.status === 401) {
          console.log("RELOGIN");
          // We need to relogin
          api.logout()        
          router.replace('/login')
      }
      return Promise.reject(error);
    }
  },

  // Send a request to the login URL and save the returned JWT
  login(creds, redirect, successCallback, errorCallback, alwaysCallback) {
    var self = this;
    var ax = axios.create({
      headers: {'Authorization': 'Basic ' + btoa(creds.username + ':' + creds.password)}
    })
    ax.post(LOGIN_URL)
      .then(function(response) {
        console.log(response)
        localStorage.setItem('token', response.data.token)
        self.user.authenticated = true
        self.user.username = creds.username
        localStorage.setItem('username', self.user.username)

        successCallback(response)

        // Redirect to a specific route
        if(redirect) {
          router.push(redirect)
        }
      })
      .catch(errorCallback)
      .then(alwaysCallback)
  },

  // Send data to the register url to register a user
  register(creds, successCallback, errorCallback, alwaysCallback) {
    axios.post(REGISTER_URL, creds)
    .then(successCallback)
    .catch(errorCallback)
    .then(alwaysCallback)
  },

  // To log out, we just need to remove the token
  logout() {
    localStorage.removeItem('token')
    this.user.authenticated = false
    console.log("logout")
  },

  checkAuth() {
    var jwt = localStorage.getItem('token')
    this.user.authenticated= jwt != undefined
    this.user.username = localStorage.getItem('username')
  },

  // The object to be passed as a header for authenticated requests
  getAuthHeader() {
    return {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  },

  // Adds an interceptor to an axios instance
  addResponseInterceptor: function(axiosInstance) {

    axiosInstance.interceptors.response.use(
        this.responseInterceptor.onSuccess, 
        this.responseInterceptor.onError
    );
  },

  createGame(data, successCallback, errorCallback, alwaysCallback) {
    var self = this
    var ax = axios.create({
      headers: self.getAuthHeader()
    })
    this.addResponseInterceptor(ax);
    ax.post(CREATE_GAME_URL, data)
       .then(successCallback)
       .catch(errorCallback)
       .then(alwaysCallback)
  },

  getGames(successCallback, errorCallback, alwaysCallback){
    var self = this
    var ax = axios.create({
      headers: self.getAuthHeader()
    })
    this.addResponseInterceptor(ax);

    ax.get(GET_GAMES_URL)
      .then(successCallback)
      .catch(errorCallback)
      .then(alwaysCallback)
  },

  getGame(gameId, successCallback, errorCallback, alwaysCallback) {
    var self = this
    var ax = axios.create({
      headers: self.getAuthHeader()
    })
    this.addResponseInterceptor(ax);
    ax.get(GET_GAME_URL.replace(':id', gameId))
        .then(successCallback)
        .catch(errorCallback)
        .then(alwaysCallback)
  },

  updateGame(gameId, data, successCallback, errorCallback, alwaysCallback) {
    var self = this
    var ax = axios.create({
      headers: self.getAuthHeader()
    })
    this.addResponseInterceptor(ax);
    ax.put(UPDATE_GAME_URL.replace(':id', gameId), data)
                 .then(successCallback)
                 .catch(errorCallback)
                 .then(alwaysCallback)
  },

  deleteGame(gameId, successCallback, errorCallback, alwaysCallback) {
    var self = this
    var ax = axios.create({
      headers: self.getAuthHeader()
    })
    this.addResponseInterceptor(ax);
    ax.delete(DELETE_GAME_URL.replace(':id', gameId))
                 .then(successCallback)
                 .catch(errorCallback)
                 .then(alwaysCallback)
  },

  getGameNews(gameId, params, successCallback, errorCallback, alwaysCallback) {
    var self = this
    var ax = axios.create({
      headers: self.getAuthHeader()
    })
    this.addResponseInterceptor(ax);
    ax.get(GET_NEWS_URL + '?gameId=' + gameId, { params: params })
                 .then(successCallback)
                 .catch(errorCallback)
                 .then(alwaysCallback)
  },

  getLeaderboard(gameId, successCallback, errorCallback, alwaysCallback) {
    var self = this
    var ax = axios.create({
      headers: self.getAuthHeader()
    })
    this.addResponseInterceptor(ax);
    ax.get(GET_GAME_LEADERBOARD.replace(':id',  gameId))
                 .then(successCallback)
                 .catch(errorCallback)
                 .then(alwaysCallback)
  },

  getChallenges(gameId, params, successCallback, errorCallback, alwaysCallback) {
    var self = this
    var ax = axios.create({
      headers: self.getAuthHeader()
    })
    this.addResponseInterceptor(ax);
    ax.get(GET_CHALLENGES_URL.replace(':id', gameId), { params: params })
                 .then(successCallback)
                 .catch(errorCallback)
                 .then(alwaysCallback)
  },

  createChallenge(gameId, data, successCallback, errorCallback, alwaysCallback) {
    var self = this
    var ax = axios.create({
      headers: self.getAuthHeader()
    })
    this.addResponseInterceptor(ax);
    ax.post(CREATE_CHALLENGE_URL.replace(':id', gameId), data)
               .then(successCallback)
               .catch(errorCallback)
               .then(alwaysCallback)
  },

  getChallenge(challengeId, successCallback, errorCallback, alwaysCallback) {
    var self = this
    var ax = axios.create({
      headers: self.getAuthHeader()
    })
    this.addResponseInterceptor(ax);
    ax.get(GET_CHALLENGE_URL.replace(':id',  challengeId))
                 .then(successCallback)
                 .catch(errorCallback)
                 .then(alwaysCallback)
  },

  deleteChallenge(id, successCallback, errorCallback, alwaysCallback) {
    var self = this
    var ax = axios.create({
      headers: self.getAuthHeader()
    })
    this.addResponseInterceptor(ax);
    ax.delete(DELETE_CHALLENGE_URL.replace(':id', id))
                 .then(successCallback)
                 .catch(errorCallback)
                 .then(alwaysCallback)
  },

  // Completes a challenge for currently authenticated user
  completeChallenge(challengeId, successCallback, errorCallback, alwaysCallback) {
    var self = this
    var ax = axios.create({
      headers: self.getAuthHeader()
    })
    this.addResponseInterceptor(ax);
    ax.post(COMPLETE_CHALLENGE_URL.replace(':id',  challengeId), {})
                 .then(successCallback)
                 .catch(errorCallback)
                 .then(alwaysCallback)
  },

  // Cancels a challenge score for an authenticated user
  cancelChallenge(challengeId, successCallback, errorCallback, alwaysCallback) {
    var self = this
    var ax = axios.create({
      headers: self.getAuthHeader()
    })
    this.addResponseInterceptor(ax);
    ax.post(CANCEL_CHALLENGE_URL.replace(':id',  challengeId), {})
                 .then(successCallback)
                 .catch(errorCallback)
                 .then(alwaysCallback)
  },

  completeChallengeBatch(challengeIds, successCallback, errorCallback, alwaysCallback) {
    var self = this
    var ax = axios.create({
      headers: self.getAuthHeader()
    })
    this.addResponseInterceptor(ax);
    ax.post(COMPLETE_CHALLENGE_BATCH_URL, challengeIds)
                 .then(successCallback)
                 .catch(errorCallback)
                 .then(alwaysCallback)
  },

  getNews(params, successCallback, errorCallback, alwaysCallback) {
    var self = this
    var ax = axios.create({
      headers: self.getAuthHeader()
    })
    this.addResponseInterceptor(ax);
    ax.get(GET_NEWS_URL, { params: params })
                 .then(successCallback)
                 .catch(errorCallback)
                 .then(alwaysCallback)
  },

  getUsers(successCallback, errorCallback, alwaysCallback) {
    var self = this
    var ax = axios.create({
      headers: self.getAuthHeader()
    })
    this.addResponseInterceptor(ax);
    ax.get(GET_USERS_URL)
                 .then(successCallback)
                 .catch(errorCallback)
                 .then(alwaysCallback)
  }
}

export default api

