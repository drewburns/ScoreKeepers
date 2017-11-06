class Comment < ApplicationRecord
	belongs_to :user
	belongs_to :post
	has_reputation :votes, source: :user, aggregated_by: :sum

	def score
		return self.reputation_for(:votes)
	end
end
