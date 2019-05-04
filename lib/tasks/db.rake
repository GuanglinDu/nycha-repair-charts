# Nithin Bekal: Rake task to drop and reseed database in Rails
# https://nithinbekal.com/posts/rake-db-reseed/
namespace :db do
  desc 'Drop, create, migrate then seed the development database'
  task reseed: [ 'db:drop', 'db:create', 'db:migrate', 'db:seed' ] do
    puts 'Reseeding completed.'
  end
end
