module ApplicationHelper
  def do_authentication(user)
    session[:user_id] = user.id
    redirect_to root_url
  end

  def do_deauthentication
    session[:user_id] = nil
    redirect_to root_url
  end
end
