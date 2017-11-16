class Post < ApplicationRecord
	has_many :postTeams
	has_many :teams, through: :postTeams
	has_reputation :votes, source: :user, aggregated_by: :sum
	belongs_to :user
	has_many :comments
  validates :title, presence: true
  validates :content, presence: true

  # validates :picture, presence: true
	mount_uploader :picture, PictureUploader



	def score
		return self.reputation_for(:votes).to_int
	end

	def writer
		return self.user.name
	end

	def writer_id
		return self.user.id
	end

	def header_image
		return self.picture
	end

	def score_for(user)
		votes = self.evaluations.where(source_id: user.id)
		if votes.count == 0 
			return nil
		else
			return votes.first.value
		end
	end

	def self.search(search)
  	# Title is for the above case, the OP incorrectly had 'name'
 		where("title LIKE ?", "%#{search}%")
	end

end
