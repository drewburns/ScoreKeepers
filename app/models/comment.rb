class Comment < ApplicationRecord
	belongs_to :user
	belongs_to :post
	has_reputation :votes, source: :user, aggregated_by: :sum

	def score
		return self.reputation_for(:votes).to_i
	end

	def score_for(user)
		votes = self.evaluations.where(source_id: user.id)
		5.times do
			puts "-" * 10
		end
		p votes
		if votes.count == 0 
			return nil
		else
			return votes.first.value.to_i
		end
	end
end
