class UsersController < ApplicationController
  # wrap_parameters :user, include: [:user_id, :name, :email , :password , :password_digest, :token, :author]



  def show 
  	@user = User.find(params[:id])
    users = []
    User.all.each do |user|
      users << user if user.posts.count > 0
    end
    @users = users.sort_by { |author| author.posts.map(&:score).inject { |sum, post| sum + post } }.reverse.first(5)
  end

  def creator
    @user = User.find(params[:id])
  end

  def admin 
    @user = User.find(params[:id])
    @posts = Post.where(status: "pending").sort_by{|p| p.time_submitted}
  end

  # def leaderboard
  #   @users = User.all
  #   @users.sort_by{|author| author.posts.map{|post| post.score}.inject{|sum,post| sum + post }}.reverse

  # end


  private

    def user_params
      params.require(:user).permit(:user_id, :name, :email , :password , :password_digest, :token, :author)
    end
end
