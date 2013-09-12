task :add_bujits => :environment do
  User.all.each do |user|
    bujit = user.bujit
    bujit.add if (bujit.never_added? || bujit.should_be_added?)
  end
end
