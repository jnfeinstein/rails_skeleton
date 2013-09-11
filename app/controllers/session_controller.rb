class SessionController < ApplicationController
  def create
    if user = User.authenticate(params[:email], params[:password])
      do_authentication(user)
    else
      flash.now[:invalid] = 'Invalid credentials'
      render 'new'
    end
  end

  def destroy
    do_deauthentication
  end
end
