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

end
