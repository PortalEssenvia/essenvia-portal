CREATE POLICY "Authenticated users can upload blog images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-images');
CREATE POLICY "Authenticated users can update blog images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'blog-images');
CREATE POLICY "Authenticated users can delete blog images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blog-images');
CREATE POLICY "Anyone can read blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');