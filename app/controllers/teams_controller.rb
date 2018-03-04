class TeamsController < ApplicationController
  def search
    if params[:search]
      @teams = Team.search(params[:search]).order("created_at DESC")
    else
    end
  end

  def show
    users = []
    @team = Team.friendly.find(params[:id])
    User.all.each do |user|
      p "_________STUFF__________"
      p user
      p @team.id
      p user.team_posts(@team.id)
      users << user if user.team_posts(@team.id).where('posts.created_at >= ?', 1.month.ago).count > 0
    end
    @posts = @team.posts.paginate(:page => params[:page])
    if @team.posts.count != 0
      # if @team.posts.where('created_at >= ?', 1.week.ago).count > 1
      #   @users = User.first(5)
      # else
        # sorted = @team.posts.where('created_at >= ?', 1.week.ago).map(&:score).inject { |sum, post| sum + post } }.reverse.first(5)
        # @users = sorted.map { |post| post.user  }
      @users = users.sort_by { |author| author.team_posts(@team.id).where('posts.created_at >= ?', 1.month.ago).map(&:score).inject { |sum, post| sum + post } }.reverse.first(5)
      # end
      # sorted = @team.posts.where('created_at >= ?', 1.week.ago).map(&:score).inject { |sum, post| sum + post } }

      # users.sort_by { |author| author.posts.where('created_at >= ?', 1.week.ago).map(&:score).inject { |sum, post| sum + post } }.reverse.first(5)
    else
      @users = User.first(5)
    end
  end

  def vote
    if params[:user_id]
      @value = params[:type] == 'approve' ? 1.0 : -1.0
      @team = Team.find(params[:id])
      @user = User.find(params[:user_id])

      if @user && @team
        @team.add_or_update_evaluation(params[:vote_name].to_sym, @value, @user)
        render file: 'teams/vote.js.erb'
        # redirect_back fallback_location: root_path, notice: 'Vote counted'
      else
        render file: 'shared/error.js.erb'
        # redirect_back fallback_location: root_path, alert: 'Error'
      end
    else
      render file: 'shared/error.js.erb'
    end
  end

  def index
    @teams = Team.all
    @baseball = @teams.where(sport_string: "baseball").order('name ASC')
    @soccer = @teams.where(sport_string: "soccer").order('name ASC')
    @basketball = @teams.where(sport_string: "basketball").order('name ASC')
    @hockey = @teams.where(sport_string: "hockey").order('name ASC')
    @football = @teams.where(sport_string: "football").order('name ASC')
  end

  def coach_ratings

  end


  def rankings
    @teams = Team.all
    @baseball = @teams.where(sport_string: "baseball")
    @soccer = @teams.where(sport_string: "soccer")
    @basketball = @teams.where(sport_string: "basketball")
    @hockey = @teams.where(sport_string: "hockey")
    @football = @teams.where(sport_string: "football")
    # render 'teams/rankings2.html.erb'


  end

  def rankings2
    @basketball = @teams.where(sport_string: "basketball")
  end

end
