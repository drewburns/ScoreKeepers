class TeamsController < ApplicationController
  def search
    if params[:search]
      @teams = Team.search(params[:search]).order("created_at DESC")
    else
    end
  end

  def show
    @team = Team.find(params[:id])
  end

  def index
    @teams = Team.all
  end
end