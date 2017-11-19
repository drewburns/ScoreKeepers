Rails.application.routes.draw do
  devise_for :users

  root      'posts#index'
  resources :users, only: [:index, :show, :edit, :update]

  get '/sports' => "posts#sports"
  get '/teams/posts' => "posts#teams"
  get '/userposts'  => "posts#user"

  get '/creator' => "users#creator"

  get '/search/posts' => "posts#search"

  get '/admin' => "users#admin"

  post '/reject' => "posts#reject"

  get '/sandbox' => 'posts#sandbox'

  resources :users, only: [:index, :show, :create, :update, :destroy]
  resources :posts, only: [:index, :show, :create, :update, :destroy, :new, :edit]

  resources :teams , only: [:index,:show]
  resources :user_teams
  resources :comments
  # update these two later

  post '/vote/team' => "teams#vote"

  post '/comment/vote' => "comments#vote"

  get '/search/teams' => "teams#search"

  get '/leaderboard' => "users#leaderboard"

  post '/vote/post' => "posts#vote"

  post '/postTeams' => "post_teams#create"
  delete '/postTeams' => "post_teams#destroy"

  # post '/userTeams' => "user_teams#create"
  # delete '/userTeams' => "user_teams#destroy"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
