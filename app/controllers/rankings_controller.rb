class RankingsController < ApplicationController

  def NBAteam
    @teams = Team.all
    @basketball = @teams.where(sport_string: "basketball")
  end

  def NBAcoach
    @teams = Team.all
    @basketball = @teams.where(sport_string: "basketball")
  end

  def NBAfrontoffice
    @teams = Team.all
    @basketball = @teams.where(sport_string: "basketball")
  end

  def NBAstadium
    @teams = Team.all
    @basketball = @teams.where(sport_string: "basketball")
  end

  def MLBteam
    @teams = Team.all
    @baseball = @teams.where(sport_string: "baseball")
  end

  def MLBcoach
    @teams = Team.all
    @baseball = @teams.where(sport_string: "baseball")
  end

  def MLBfrontoffice
    @teams = Team.all
    @baseball = @teams.where(sport_string: "baseball")
  end

  def MLBstadium
    @teams = Team.all
    @baseball = @teams.where(sport_string: "baseball")
  end

  def NFLteam
    @teams = Team.all
    @football = @teams.where(sport_string: "football")
  end

  def NFLcoach
    @teams = Team.all
    @football = @teams.where(sport_string: "football")
  end

  def NFLfrontoffice
    @teams = Team.all
    @football = @teams.where(sport_string: "football")
  end

  def NFLstadium
    @teams = Team.all
    @football = @teams.where(sport_string: "football")
  end

  def NHLstadium
    @teams = Team.all
    @hockey = @teams.where(sport_string: "hockey")
  end

  def NHLcoach
    @teams = Team.all
    @hockey = @teams.where(sport_string: "hockey")
  end

  def NHLteam
    @teams = Team.all
    @hockey = @teams.where(sport_string: "hockey")
  end

  def NHLfrontoffice
    @teams = Team.all
    @hockey = @teams.where(sport_string: "hockey")
  end

end
