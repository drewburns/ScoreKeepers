class UsersController < ApplicationController
  # wrap_parameters :user, include: [:user_id, :name, :email , :password , :password_digest, :token, :author]



  def show 
  	@user = User.find(params[:id])
  end

  def leaderboard
    @users = User.all
    @users.sort_by{|author| author.posts.map{|post| post.score}.inject{|sum,post| sum + post }}.reverse

  end


  private

    def user_params
      params.require(:user).permit(:user_id, :name, :email , :password , :password_digest, :token, :author)
    end
end
