class RankingsController < ApplicationController

  def NBAteam
    @top_basketball = Team.where(sport_string: 'basketball').sort_by{|team| team.team_score}.reverse.first(30)
  end

  def NBAcoach
    @top_basketball = Team.where(sport_string: 'basketball').sort_by{|team| team.coach_score}.reverse.first(30)
  end

  def NBAfrontoffice
    @top_basketball = Team.where(sport_string: 'basketball').sort_by{|team| team.coach_score}.reverse.first(30)
  end

  def NBAstadium
    @top_basketball = Team.where(sport_string: 'basketball').sort_by{|team| team.stadium_score}.reverse.first(30)
  end

end
