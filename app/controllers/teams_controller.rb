class TeamsController < ApplicationController
  def search
    if params[:search]
      @teams = Team.search(params[:search]).order("created_at DESC")
    else
    end
  end

  def show
    @team = Team.find(params[:id])
    if @team.posts.count != 0
      # sorted = @team.posts.where('created_at >= ?', 1.week.ago).map(&:score).inject { |sum, post| sum + post } }
      # users.sort_by { |author| author.posts.where('created_at >= ?', 1.week.ago).map(&:score).inject { |sum, post| sum + post } }.reverse.first(5)
    end
  end

  def vote
    if params[:user_id]
      @value = params[:type] == 'approve' ? 1 : -1
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
  end
end