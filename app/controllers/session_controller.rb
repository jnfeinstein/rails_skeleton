class SessionController < ApplicationController
  def create
    if user = User.authenticate(params[:email], params[:password])
      do_authentication(user)
    else
      render 'new'
    end
  end

  def destroy
    session[:user_id] = nil
    redirect_to root_url
  end
end
