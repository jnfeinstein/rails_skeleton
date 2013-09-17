class SessionController < ApplicationController

  def create
    user = User.find_by_email(params[:email])
    if user.nil?
      render :json => ['No user with that email address'], :status => :unprocessable_entity
    elsif user.password != params[:password]
      render :json => ['Incorrect password'], :status => :unprocessable_entity
    else
      render :json => [user.make_token]
    end
  end
end
