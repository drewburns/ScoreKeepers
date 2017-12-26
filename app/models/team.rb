class Team < ApplicationRecord
  extend FriendlyId
  friendly_id :name, use: :slugged
  
	has_many :postTeams
	has_many :posts, through: :postTeams
	has_many :userTeams
	has_many :users, through: :userTeams
  has_many :debates

	has_reputation :team_score, source: :user, aggregated_by: :sum
	has_reputation :frontoffice_score, source: :user, aggregated_by: :sum
	has_reputation :coach_score, source: :user, aggregated_by: :sum
	has_reputation :stadium_score, source: :user, aggregated_by: :sum

	def self.search(search)
  	# Title is for the above case, the OP incorrectly had 'name'
 		where("name LIKE ?", "%#{search}%")
	end
	
	def team_score
    reputation_for(:team_score).to_int
  end

  def coach_debate
    self.debates.where(about: "coach").first
  end

  def fo_debate
    self.debates.where(about: "fo").first
  end

  def team_debate
    self.debates.where(about: "team").first
  end

  def stadium_debate
    self.debates.where(about: "stadium").first
  end

  
  def frontoffice_score
    reputation_for(:frontoffice_score).to_int
  end

  def coach_score
    reputation_for(:coach_score).to_int 
  end

  def stadium_score
    reputation_for(:stadium_score).to_int
  end


  def chart_data(type)
  	total_reps = self.reputations.where(reputation_name: type)
  	yes_reps = total_reps.where(value: 1.0)

  	y_count = yes_reps.count
  	n_count =  total_reps.count - y_count
  	hash = {}
  	p total_reps.count
  	unless total_reps.count == 0
  		hash = {"Approve" => y_count, "Disapprove" => n_count }
  	else
  		hash = {"Approve" => 1, "Disapprove" => 0 }
  	end
  	p hash
  	return hash
  end


end
#<ReputationSystem::Evaluation id: 1,reputation_name: "votes", source_type: "User",
# source_id: 1, target_type: "Post", target_id: 1, value: 0.0, created_at: "2017-11-13 03:09:04", updated_at: "2017-11-14 19:12:49", data: {}> 
# <%= pie_chart @team.chart_data_team %>
# <%= pie_chart @team.chart_data_fo %>
# <%= pie_chart @team.chart_data_stadium %>
# <%= pie_chart @team.chart_data_coach %>