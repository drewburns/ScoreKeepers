class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  validates :email, uniqueness: true
  validates :email, presence: true
  validates :username, presence: true


  
	has_many :userTeams
	has_many :teams, through: :userTeams
	has_many :posts

	def this_weeks_score
		posts = self.posts.where('created_at >= ?', 1.week.ago)
		scores = posts.map{|post| post.score}
		puts "__________"
		puts scores.first
		return scores.first
	end

	def self.valid_login?(email, password)
    user = find_by(email: email)
    if user && user.authenticate(password)
      user
    end
  end
end
