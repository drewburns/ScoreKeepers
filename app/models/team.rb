class Team < ApplicationRecord
	has_many :postTeams
	has_many :posts, through: :postTeams
	has_many :userTeams
	has_many :users, through: :userTeams


	def self.search(search)
  	# Title is for the above case, the OP incorrectly had 'name'
 		where("name LIKE ?", "%#{search}%")
	end
end
