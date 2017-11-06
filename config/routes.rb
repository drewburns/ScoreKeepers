Rails.application.routes.draw do
  devise_for :users

  root      'posts#index'
  resources :users, only: [:index, :show, :edit, :update]

  get '/sports/posts' => "posts#sports"
  get '/teams/posts' => "posts#teams"
  get '/userposts'  => "posts#user"

  get '/search/posts' => "posts#search"

  resources :users, only: [:index, :show, :create, :update, :destroy]
  resources :posts, only: [:index, :show, :create, :update, :destroy, :new]

  resources :teams , only: [:index,:show]
  resources :user_teams


  get '/search/teams' => "teams#search"

  get '/leaderboard' => "users#leaderboard"

  post '/vote/post' => "posts#vote"

  post '/postTeams' => "post_teams#create"
  delete '/postTeams' => "post_teams#destroy"

  post '/userTeams' => "user_teams#create"
  delete '/userTeams' => "user_teams#destroy"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
