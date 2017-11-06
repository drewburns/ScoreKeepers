class UsersController < ApplicationController
  # wrap_parameters :user, include: [:user_id, :name, :email , :password , :password_digest, :token, :author]



  def show 
  	@user = User.find(params[:id])
  end

  def leaderboard
    @users = User.where(author: true)
    @users.sort_by{|author| author.posts.where('created_at >= ?', 1.week.ago).inject {|sum, post| sum + post.score }}.first(5)

  end


  private

    def user_params
      params.require(:user).permit(:user_id, :name, :email , :password , :password_digest, :token, :author)
    end
end
