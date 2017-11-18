class Team < ApplicationRecord
	has_many :postTeams
	has_many :posts, through: :postTeams
	has_many :userTeams
	has_many :users, through: :userTeams

	has_reputation :team_score, source: :user, aggregated_by: :sum
	has_reputation :frontoffice_score, source: :user, aggregated_by: :sum
	has_reputation :coach_score, source: :user, aggregated_by: :sum
	has_reputation :stadium_score, source: :user, aggregated_by: :sum

	def self.search(search)
  	# Title is for the above case, the OP incorrectly had 'name'
 		where("name LIKE ?", "%#{search}%")
	end
end
