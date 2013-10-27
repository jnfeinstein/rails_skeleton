Skeleton::Application.routes.draw do
  # Add resources here
  resources :user
  resources :session
  
  # Set your main route
  root 'welcome#index'


  # This prepares the app cache with all of the application assets
  if Rails.env.production?
    offline = Rack::Offline.configure :cache_interval => 604800 do
      cache ActionController::Base.helpers.asset_path("404.html")
      cache ActionController::Base.helpers.asset_path("422.html")
      cache ActionController::Base.helpers.asset_path("500.html")    
      cache ActionController::Base.helpers.asset_path("application.css")
      cache ActionController::Base.helpers.asset_path("application.js")
      cache ActionController::Base.helpers.asset_path("loader.gif")  

      network "*"
    end
    get "/application.manifest" => offline  
  end
end
