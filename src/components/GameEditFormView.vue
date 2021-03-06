<template>
    <div id="game-form" class="modal-container">
      <form id="login-form" v-on:submit.prevent="updateGame">
        <!-- title -->
        <div class="form-group">
            <p>Title</p>
            <div class="form-error-block" v-if="errors.title">
                <p class="form-error" v-for="error in errors.title">{{ error }}</p>
            </div>
            <el-input
                v-model="fields.title"
                type="text"
                name="title"
                placeholder="Enter title"
                required>
            </el-input>
        </div>
        <!-- description -->
        <div class="form-group">
            <p>Description</p>
            <div class="form-error-block" v-if="errors.description">
                <p class="form-error" v-for="error in errors.description">{{ error }}</p>
            </div>
            <el-input
                type="textarea"
                v-model="fields.description"
                name="description"
                placeholder="Enter description"
                required>
            </el-input>
        </div>
        <!-- start date -->
        <div class="form-group">
            <p>Start date</p>
            <div class="form-error-block" v-if="errors.start_date">
                <p class="form-error" v-for="error in errors.start_date">{{ error }}</p>
            </div>

            <el-date-picker
                  v-model="fields.start_date"
                  type="datetime"
                  format="yyyy/MM/dd HH:mm"
                  placeholder="Select start date and time"
                  :picker-options="pickerOptions">
            </el-date-picker>
        </div>
        <!-- end date -->
        <div class="form-group">
            <p>End date</p>
            <div class="form-error-block" v-if="errors.end_date">
                <p class="form-error" v-for="error in errors.end_date">{{ error }}</p>
            </div>
            <el-date-picker
                  v-model="fields.end_date"
                  type="datetime"
                  format="yyyy/MM/dd HH:mm"
                  placeholder="Select start date and time"
                  :picker-options="pickerOptions">
            </el-date-picker>
        </div>

        <!-- Administrators -->
        <div class="form-group">
            <p>Administrators</p>
            <div class="form-error-block" v-if="errors.administrators">
                <p class="form-error" v-for="error in errors.administrators">{{ error }}</p>
            </div>
            <UserSelector
                          placeholder="Administrators"
                          :default-users="administrators"
                          v-model="administrators"
                          ></UserSelector>
        </div>

        <!-- Visibility -->
        <div class="form-group">
          <p>Visibility</p>
          <el-radio-group v-model="visibility">
            <el-radio-button label="Public"><i class="glyphicon glyphicon-globe">&nbsp;</i>Public</el-radio-button>
            <el-radio-button label="Private"><i class="glyphicon glyphicon-lock">&nbsp;</i>Private</el-radio-button>
          </el-radio-group>
        </div>
        <!-- Authorized Players -->
        <div class="form-group" v-if="visibility == 'Private'">
            <p>Authorized Players</p>
            <div class="form-error-block" v-if="errors.authorized_players">
                <p class="form-error" v-for="error in errors.authorized_players">{{ error }}</p>
            </div>
            <UserSelector
                          placeholder="Authorized players"
                          :default-users="authorized_players"
                          v-model="authorized_players"
                          ></UserSelector>
        </div>
      </form>
      <el-button type="primary" @click="updateGame" :loading="formInProcess">Update</el-button>
    </div>
</template>

<script>
import UserSelector from './UserSelector.vue'

import moment from 'moment'

import api from '../api'

export default {

    props: ["game"],

    data: () => {
        return {
            formInProcess: false,

            fields: {/*
                title: '',
                description: '',
                start_date: '',
                end_date: '',
                visibility: '',*/
            },
            // watchers for select
            administrators : '',
            authorized_players : '',


            visibility: '',

            errors: {},


            pickerOptions: {
              shortcuts: [{
                text: 'Today',
                onClick(picker) {
                  picker.$emit('pick', new Date());
                }
              },
              {
                text: 'Tomorrow',
                onClick(picker) {
                  const date = new Date();
                  date.setTime(date.getTime() + 3600 * 1000 * 24);
                  picker.$emit('pick', date);
                }
              },
              {
                text: 'Next week',
                onClick(picker) {
                  const date = new Date();
                  date.setTime(date.getTime() + 3600 * 1000 * 24 * 7);
                  picker.$emit('pick', date);
                }
              }]
            },
        }
    },

    created: function() {
     
      this.fields = {
          title: this.game.title,
          description: this.game.description,
          start_date: this.game.start_date,
          end_date: this.game.end_date,
      }

      //Set visibility
      var vis = this.game.visibility.replace('VISIBILITY_','').toLowerCase()
      vis = vis.charAt(0).toUpperCase() + vis.slice(1);
      this.visibility = vis

      // Set Admins
      var admins = []
      for (var i = this.game.administrators.length - 1; i >= 0; i--) {
        var user = this.game.administrators[i]
        admins.push(user.username)
      }
      this.administrators = admins

      // Set Authorized users
      var authPlayers = []
      for (var i = this.game.authorized_players.length - 1; i >= 0; i--) {
        var user = this.game.authorized_players[i]
        authPlayers.push(user.username)
      }
      this.authorized_players = authPlayers
    },

    watch: {
      visibility: function(newValue) {
        newValue = newValue + ''
        this.fields.visibility = 'VISIBILITY_' + newValue.toUpperCase()
      }
    },

    methods: {
        updateGame: function() {
          this.formInProcess = true

          this.fields.administrators = this.administrators
          this.fields.authorized_players = this.authorized_players

          console.log(this.fields)

          var self = this
          var response = api.updateGame(this.game.id, this.fields,

              // SUCCES CALLBACK
              function(response) {
                self.formInProcess = false
                self.$notify({
                  title: 'Success',
                  message: 'Challenge created successfully',
                  type: 'success'
                });
              },

              // ERROR CALLBACK
              function(error) {
                self.formInProcess = false
                self.errors = error.data.errors || {}

                if(!self.errors) {
                  self.$notify.error({
                    title: 'Error',
                    message: 'There was an error creating the game, please try again later.'
                  });
                }

                if (error.response) {
                  // The request was made and the server responded with a status code
                  // that falls out of the range of 2xx
                  console.log(error.response.data);
                  console.log(error.response.status);
                  console.log(error.response.headers);
                } else if (error.request) {
                  // The request was made but no response was received
                  // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                  // http.ClientRequest in node.js
                  console.log(error.request);
                } else {
                  // Something happened in setting up the request that triggered an Error
                  console.log('Error', error.message);
                }
                console.log(error.config);
              },

              // ALWAYS CALLBACK
              function(response) {
              } 
          )
        },
    },

    components: {
      UserSelector
    }
}
</script>