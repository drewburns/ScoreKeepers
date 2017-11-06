class Post < ApplicationRecord
	has_many :postTeams
	has_many :teams, through: :postTeams
	has_reputation :votes, source: :user, aggregated_by: :sum
	belongs_to :user


	def score
		return self.reputation_for(:votes)
	end

	def writer
		return self.user.username
	end

	def writer_id
		return self.user.id
	end

	def self.search(search)
  	# Title is for the above case, the OP incorrectly had 'name'
 		where("title LIKE ?", "%#{search}%")
	end

end
