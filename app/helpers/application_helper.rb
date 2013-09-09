module ApplicationHelper
  def do_authentication(user)
    session[:user_id] = user.id
    redirect_to root_url
  end
end
