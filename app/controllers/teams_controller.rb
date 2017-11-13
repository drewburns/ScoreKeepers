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

  def index
    @teams = Team.all
  end
end