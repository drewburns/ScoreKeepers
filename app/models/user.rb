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
  has_many :comments

	def this_weeks_score
		posts = self.posts.where('created_at >= ?', 1.week.ago)
		scores = posts.map{|post| post.score}.inject{|sum, post| sum + post}
		puts "__________"
		puts scores
    if scores == nil
      return 0
    else
		  return scores
    end
	end

	def self.valid_login?(email, password)
    user = find_by(email: email)
    if user && user.authenticate(password)
      user
    end
  end

  def this_weeks_rank
    users = []
    User.all.each do |user|
      users << user if user.posts.count > 0
    end
    if users.include?(self)
      rank = users.sort_by{|author| author.posts.map{|post| post.score}.inject{|sum,post| sum + post }}.reverse.index(self)
      return rank + 1
    else 
      return "Not ranked"
    end
  end
end
