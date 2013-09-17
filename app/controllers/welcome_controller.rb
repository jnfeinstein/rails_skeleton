class WelcomeController < ApplicationController
  skip_before_filter :check_token
end
