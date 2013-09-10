class SessionController < ApplicationController
  def create
    if user = User.authenticate(params[:email], params[:password])
      do_authentication(user)
    else
      flash.now[:invalid] = 'User does not exist or password is incorrect'
      render 'new'
    end
  end

  def destroy
    do_deauthentication
  end
end
