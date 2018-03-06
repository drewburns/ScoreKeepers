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

  get '/latest' => 'posts#latest'


  resources :users, only: [:index, :show, :create, :update, :destroy]
  resources :posts, only: [:index, :show, :create, :update, :destroy, :new, :edit]

  resources :teams , only: [:index,:show]
  resources :user_teams
  resources :comments

  resources :debates , only: [:show,:new,:create,:destroy, :index]
  # update these two later

  get '/rankings' => "teams#rankings"

  get '/about' => "statics#about"

  post '/vote/team' => "teams#vote"

  post '/comment/vote' => "comments#vote"

  get '/search/teams' => "teams#search"

  get '/leaderboard' => "users#leaderboard"

  post '/vote/post' => "posts#vote"

  post '/postTeams' => "post_teams#create"
  delete '/postTeams' => "post_teams#destroy"

  get '/newmedia' => "posts#newmedia"

  get '/rankings2' => "teams#rankings2"

  get '/nbarankings' => "teams#NBArankings"

  get 'podcasts' => "statics#podcasts"



  get '/nba-coach-rankings' => "rankings#NBAcoach"

  get '/nba-team-rankings' => "rankings#NBAteam"

  get '/nba-frontoffice-rankings' => "rankings#NBAfrontoffice"

  get '/nba-stadium-rankings' => "rankings#NBAstadium"

  get '/mlb-coach-rankings' => "rankings#MLBcoach"

  get '/mlb-team-rankings' => "rankings#MLBteam"

  get '/mlb-frontoffice-rankings' => "rankings#MLBfrontoffice"

  get '/mlb-stadium-rankings' => "rankings#MLBstadium"

  get '/nfl-coach-rankings' => "rankings#NFLcoach"

  get '/nfl-team-rankings' => "rankings#NFLteam"

  get '/nfl-frontoffice-rankings' => "rankings#NFLfrontoffice"

  get '/nfl-stadium-rankings' => "rankings#NFLstadium"

  get '/nhl-coach-rankings' => "rankings#NHLcoach"

  get '/nhl-team-rankings' => "rankings#NHLteam"

  get '/nhl-frontoffice-rankings' => "rankings#NHLfrontoffice"

  get '/nhl-stadium-rankings' => "rankings#NHLstadium"
  # post '/userTeams' => "user_teams#create"
  # delete '/userTeams' => "user_teams#destroy"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
